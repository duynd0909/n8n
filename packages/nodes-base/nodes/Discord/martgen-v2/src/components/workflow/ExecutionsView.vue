<template>
	<div class="executions-view">
		<div class="executions-header">
			<h2>Execution History</h2>
		</div>

		<div class="executions-table-container">
			<a-table
				:columns="columns"
				:data-source="executions"
				:pagination="{ pageSize: 10 }"
				:row-key="(record) => record.id"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'status'">
						<a-tag :color="getStatusColor(record.status)">
							<CheckCircleFilled v-if="record.status === 'success'" />
							<CloseCircleFilled v-else-if="record.status === 'error'" />
							<LoadingOutlined v-else-if="record.status === 'running'" spin />
							<ClockCircleOutlined v-else />
							{{ record.status.toUpperCase() }}
						</a-tag>
					</template>

					<template v-else-if="column.key === 'startedAt'">
						{{ formatTime(record.startedAt) }}
					</template>

					<template v-else-if="column.key === 'duration'">
						{{ calculateDuration(record) }}
					</template>

					<template v-else-if="column.key === 'nodesExecuted'">
						{{ Object.keys(record.runData).length }}
					</template>

					<template v-else-if="column.key === 'actions'">
						<a-button type="primary" size="small" @click="openExecutionModal(record)">
							<EyeOutlined /> View
						</a-button>
					</template>
				</template>
			</a-table>
		</div>

		<!-- Execution Modal -->
		<a-modal
			v-model:open="modalVisible"
			:title="`Execution: ${selectedExecution?.id}`"
			width="90%"
			:footer="null"
			:destroy-on-close="true"
		>
			<div v-if="selectedExecution" class="execution-modal-content">
				<div class="execution-canvas">
					<VueFlow
						v-model:nodes="executionNodes"
						v-model:edges="executionEdges"
						:node-types="nodeTypes"
						:edge-types="edgeTypes"
						:default-zoom="1"
						:min-zoom="0.1"
						:max-zoom="2"
						:nodes-draggable="false"
						:elements-selectable="true"
						@node-click="handleNodeClick"
					>
						<Background pattern="dots" :pattern-color="'#aaa'" :gap="16" :size="1" />
						<Controls position="top-right" />
						<MiniMap />
					</VueFlow>
				</div>

				<!-- Node Details Drawer -->
				<a-drawer
					v-model:open="drawerVisible"
					title="Node Execution Details"
					placement="right"
					:width="500"
					:get-container="false"
				>
					<div v-if="selectedNode" class="node-details">
						<h4>{{ selectedNode.name }}</h4>

						<a-tabs v-model:activeKey="detailTab">
							<a-tab-pane key="input" tab="Input">
								<div class="detail-content">
									<JsonEditorVue
										v-if="getNodeData(selectedNode, 'input')"
										:model-value="getNodeData(selectedNode, 'input')"
										class="json-viewer"
										:mode="'text' as any"
										:main-menu-bar="false"
										:navigation-bar="false"
										:status-bar="false"
										:read-only="true"
									/>
									<div v-else class="no-data">No input data</div>
								</div>
							</a-tab-pane>

							<a-tab-pane key="output" tab="Output">
								<div class="detail-content">
									<JsonEditorVue
										v-if="getNodeData(selectedNode, 'output')"
										:model-value="getNodeData(selectedNode, 'output')"
										class="json-viewer"
										:mode="'text' as any"
										:main-menu-bar="false"
										:navigation-bar="false"
										:status-bar="false"
										:read-only="true"
									/>
									<div v-else class="no-data">No output data</div>
								</div>
							</a-tab-pane>

							<a-tab-pane key="logs" tab="Logs">
								<div class="detail-content logs">
									<div
										v-for="(log, idx) in getNodeLogs(selectedNode.id)"
										:key="idx"
										:class="['log-entry', log.level]"
									>
										<span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
										<span class="log-message">{{ log.message }}</span>
									</div>
								</div>
							</a-tab-pane>
						</a-tabs>
					</div>
				</a-drawer>
			</div>
		</a-modal>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { VueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import JsonEditorVue from 'json-editor-vue';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useExecutionStore } from '@/stores/executionStore';
import WorkflowNode from './WorkflowNode.vue';
import CustomEdge from './CustomEdge.vue';
import {
	CheckCircleFilled,
	CloseCircleFilled,
	LoadingOutlined,
	ClockCircleOutlined,
	EyeOutlined,
} from '@ant-design/icons-vue';
import type { Node, Edge } from '@vue-flow/core';

const workflowStore = useWorkflowStore();
const executionStore = useExecutionStore();

const selectedExecutionId = ref<string | null>(null);
const modalVisible = ref(false);
const drawerVisible = ref(false);
const selectedNodeId = ref<string | null>(null);
const detailTab = ref('output');

const columns = [
	{
		title: 'Execution ID',
		dataIndex: 'id',
		key: 'id',
		width: 200,
	},
	{
		title: 'Status',
		key: 'status',
		width: 140,
	},
	{
		title: 'Started At',
		key: 'startedAt',
		width: 180,
	},
	{
		title: 'Duration',
		key: 'duration',
		width: 120,
	},
	{
		title: 'Nodes Executed',
		key: 'nodesExecuted',
		width: 140,
		align: 'center' as const,
	},
	{
		title: 'Actions',
		key: 'actions',
		width: 120,
		align: 'center' as const,
	},
];

const nodeTypes = {
	custom: WorkflowNode,
};

const edgeTypes = {
	custom: CustomEdge,
};

const executions = computed(() => {
	if (!workflowStore.currentWorkflow) return [];
	return executionStore.getExecutionsForWorkflow(workflowStore.currentWorkflow.id);
});

const selectedExecution = computed(() => {
	if (!selectedExecutionId.value) return null;
	return executions.value.find((e) => e.id === selectedExecutionId.value);
});

const selectedNode = computed(() => {
	if (!selectedNodeId.value) return null;
	return workflowStore.nodes.find((n) => n.id === selectedNodeId.value);
});

// Create read-only nodes with execution status
const executionNodes = computed<Node[]>(() => {
	if (!selectedExecution.value) return [];

	return workflowStore.nodes.map((node) => {
		const taskData = selectedExecution.value!.runData[node.name];
		let borderColor = '#d9d9d9';
		let borderWidth = 1;

		if (taskData) {
			if (taskData.executionStatus === 'success') {
				borderColor = '#52c41a';
				borderWidth = 2;
			} else if (taskData.error) {
				borderColor = '#ff4d4f';
				borderWidth = 2;
			}
		}

		return {
			id: node.id,
			type: 'custom',
			position: { x: node.position[0], y: node.position[1] },
			data: {
				...node,
				executionStatus: taskData?.executionStatus,
				executionBorderColor: borderColor,
				executionBorderWidth: borderWidth,
			},
			sourcePosition: 'right' as const,
			targetPosition: 'left' as const,
		};
	});
});

const executionEdges = computed<Edge[]>(() => {
	const edges: Edge[] = [];

	for (const [sourceName, nodeConns] of Object.entries(workflowStore.connections)) {
		const sourceNode = workflowStore.nodes.find((n) => n.name === sourceName);
		if (!sourceNode) continue;

		const outputs = nodeConns.main || [];
		outputs.forEach((connections, outputIndex) => {
			if (!connections) return;

			connections.forEach((conn) => {
				const targetNode = workflowStore.nodes.find((n) => n.name === conn.node);
				if (!targetNode) return;

				edges.push({
					id: `${sourceNode.id}-${outputIndex}-${targetNode.id}-${conn.index}`,
					source: sourceNode.id,
					target: targetNode.id,
					type: 'custom',
					animated: false,
					markerEnd: 'arrowclosed',
					style: { stroke: '#ff5b00', strokeWidth: 2 },
				});
			});
		});
	}

	return edges;
});

function openExecutionModal(execution: any) {
	selectedExecutionId.value = execution.id;
	executionStore.setCurrentExecution(execution.id);
	modalVisible.value = true;
}

function getStatusColor(status: string) {
	switch (status) {
		case 'success':
			return 'success';
		case 'error':
			return 'error';
		case 'running':
			return 'processing';
		default:
			return 'default';
	}
}

function calculateDuration(execution: any) {
	if (!execution.finishedAt) return 'Running...';
	const ms = new Date(execution.finishedAt).getTime() - new Date(execution.startedAt).getTime();
	if (ms < 1000) return `${ms}ms`;
	return `${(ms / 1000).toFixed(2)}s`;
}

function handleNodeClick(event: any) {
	selectedNodeId.value = event.node.id;
	drawerVisible.value = true;
}

function formatTime(timestamp: string) {
	const date = new Date(timestamp);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);

	if (diffMins < 1) return 'Just now';
	if (diffMins < 60) return `${diffMins} min ago`;
	if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
	return date.toLocaleString();
}

function formatLogTime(timestamp: string) {
	return new Date(timestamp).toLocaleTimeString();
}

function getNodeData(node: any, type: 'input' | 'output') {
	if (!selectedExecution.value) return null;

	const taskData = selectedExecution.value.runData[node.name];
	if (!taskData) return null;

	if (type === 'output' && taskData.data) {
		return taskData.data;
	}

	if (taskData.error) {
		return taskData.error;
	}

	return null;
}

function getNodeLogs(nodeId: string) {
	return executionStore.getNodeLogs(nodeId);
}
</script>

<style scoped lang="scss">
.executions-view {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
	background: $color-bg;
	padding: $spacing-lg;
}

.executions-header {
	margin-bottom: $spacing-lg;

	h2 {
		margin: 0;
		font-size: $font-size-2xl;
		font-weight: $font-weight-semibold;
		color: $color-text;
	}
}

.executions-table-container {
	flex: 1;
	overflow: auto;
	background: white;
	border-radius: $radius-lg;
	box-shadow: $shadow-sm;
}

.execution-modal-content {
	height: 70vh;
	position: relative;
}

.execution-canvas {
	width: 100%;
	height: 100%;
	background: $color-bg-canvas;
	border-radius: $radius-md;
	overflow: hidden;
}

.node-details {
	height: 100%;
	display: flex;
	flex-direction: column;

	h4 {
		font-size: $font-size-lg;
		font-weight: $font-weight-semibold;
		margin-bottom: $spacing-lg;
	}
}

:deep(.ant-tabs) {
	flex: 1;
	display: flex;
	flex-direction: column;

	.ant-tabs-content {
		flex: 1;
		height: 100%;
	}

	.ant-tabs-tabpane {
		height: 100%;
	}
}

.detail-content {
	height: 100%;
	display: flex;
	flex-direction: column;

	&.logs {
		overflow-y: auto;
	}
}

.json-viewer {
	flex: 1;
	height: 100%;
}

.no-data {
	color: #999;
	font-style: italic;
	padding: $spacing-md;
}

.log-entry {
	padding: $spacing-xs $spacing-sm;
	border-left: 2px solid transparent;
	margin-bottom: $spacing-xs;
	font-family: $font-family-mono;
	font-size: $font-size-xs;

	&.info {
		border-left-color: $color-info;
		background: $color-info-bg;
	}

	&.warn {
		border-left-color: $color-warning;
		background: $color-warning-bg;
	}

	&.error {
		border-left-color: $color-error;
		background: $color-error-bg;
	}
}

.log-time {
	color: $color-text-secondary;
	margin-right: $spacing-sm;
}

.log-message {
	color: $color-text;
}
</style>
