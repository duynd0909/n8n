<template>
	<a-modal
		:open="visible"
		:title="nodeTemplate?.displayName"
		width="95%"
		:style="{ top: '20px' }"
		@update:open="(val) => $emit('update:visible', val)"
		@cancel="handleCancel"
	>
		<div class="node-config-modal">
			<a-row :gutter="0" style="height: 100%">
				<!-- INPUT Section (Left) - Hide for first node/trigger -->
				<a-col v-if="!isFirstNode" :xs="24" :sm="24" :md="8" :lg="7" class="modal-column">
					<div class="modal-section input-section">
						<SchemaViewer
							title="INPUT"
							:node-id="currentNodeId"
							:data="inputData"
							:status="inputDataStatus"
							:default-view="inputTab"
							:searchable="true"
							:editable="true"
							:draggable="true"
							@view-change="handleInputViewChange"
							@field-drag="handleFieldDragStart"
							@mock-data-save="handleSaveMockData"
						/>
					</div>
				</a-col>

				<!-- NODE CONFIG Section (Center) -->
				<a-col :xs="24" :sm="24" :md="8" :lg="10" class="modal-column">
					<div class="modal-section config-section">
						<div class="section-header">
							<div class="header-title">
								<a-space>
									<component :is="nodeIcon" :style="{ color: nodeColor }" />
									<h3>{{ modalTitle }}</h3>
								</a-space>
								<a-button type="primary" size="small" @click="handleExecuteStep">
									Execute step
								</a-button>
							</div>
						</div>

						<a-tabs v-model:activeKey="configTab" class="config-tabs">
							<a-tab-pane key="parameters" tab="Parameters">
								<div class="config-content">
									<a-form layout="vertical">
										<!-- Node Name -->
										<a-form-item label="Name">
											<a-input v-model:value="nodeName" placeholder="Enter node name" />
										</a-form-item>

										<!-- Dynamic Node-Specific Configuration -->
										<component
											:is="nodeConfigComponent"
											v-if="nodeConfigComponent"
											v-model="nodeParameters"
										/>

										<!-- Fallback for unsupported node types -->
										<a-alert
											v-else
											message="Configuration not available"
											description="This node type does not have a configuration component yet."
											type="info"
											show-icon
										/>
									</a-form>
								</div>
							</a-tab-pane>

							<a-tab-pane key="settings" tab="Settings">
								<div class="config-content">
									<a-form layout="vertical">
										<a-form-item label="Notes" help="notes to save with the node">
											<a-textarea v-model:value="notes" :rows="3" placeholder="Add notes..." />
										</a-form-item>

										<a-form-item label="Continue On Fail">
											<a-switch v-model:checked="continueOnFail" />
											<p class="form-help-text">
												By default, the workflow stops executing if this node has an issue
											</p>
										</a-form-item>
									</a-form>
								</div>
							</a-tab-pane>
						</a-tabs>
					</div>
				</a-col>

				<!-- OUTPUT Section (Right) -->
				<a-col
					:xs="24"
					:sm="24"
					:md="isFirstNode ? 16 : 8"
					:lg="isFirstNode ? 14 : 7"
					class="modal-column"
				>
					<div class="modal-section output-section">
						<SchemaViewer
							title="OUTPUT"
							:node-id="currentNodeId"
							:data="outputData"
							:status="outputDataStatus"
							:default-view="outputTab"
							:searchable="true"
							:editable="true"
							:draggable="false"
							@view-change="handleOutputViewChange"
							@field-drag="handleFieldDragStart"
							@mock-data-save="handleSaveMockData"
						/>
					</div>
				</a-col>
			</a-row>
		</div>

		<template #footer>
			<div class="modal-footer">
				<a-button @click="handleCancel">Cancel</a-button>
				<a-button type="primary" @click="handleSave">Save</a-button>
			</div>
		</template>
	</a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent } from 'vue';
import { useWorkflowStore } from '@/stores/workflowStore';
import { message } from 'ant-design-vue';
import {
	DatabaseOutlined,
	SearchOutlined,
	SwapOutlined,
	BranchesOutlined,
	SplitCellsOutlined,
	SyncOutlined,
	ClockCircleOutlined,
	CodeOutlined,
} from '@ant-design/icons-vue';
import SchemaViewer from './schema/SchemaViewer.vue';
import { ViewMode } from './schema/types';

interface Props {
	visible: boolean;
	nodeTemplate: any;
	nodeId?: string; // Optional node ID for editing existing nodes
}

interface Emits {
	(e: 'update:visible', value: boolean): void;
	(e: 'save', nodeData: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const workflowStore = useWorkflowStore();

// Form state
const nodeName = ref('');
const nodeParameters = ref<any>({});
const notes = ref('');
const continueOnFail = ref(false);

// Tab states
const inputTab = ref<ViewMode>('schema');
const outputTab = ref<ViewMode>('schema');
const configTab = ref('parameters');

// Current node ID (for new nodes, use temp ID until saved)
const currentNodeId = computed(() => props.nodeId || `temp-${Date.now()}`);

// Get previous node data for INPUT
const inputData = computed(() => {
	if (isFirstNode.value) return null;

	// Find the previous connected node
	const previousNodeName = findPreviousConnectedNode(props.nodeId);
	if (previousNodeName) {
		const previousNode = workflowStore.nodes.find((n) => n.name === previousNodeName);
		if (previousNode) {
			// Get execution data or mock data
			const executionData = workflowStore.getNodeExecutionData(previousNode.id);
			if (executionData?.data?.length) {
				return executionData.data[0]; // Return first item
			}
		}
	}

	// For new nodes without connections, show the last executed node's output
	if (!props.nodeId && workflowStore.nodes.length > 0) {
		// Find the most recently executed node
		const sortedNodes = [...workflowStore.nodes].sort((a, b) => {
			const aExec = workflowStore.getNodeExecutionData(a.id);
			const bExec = workflowStore.getNodeExecutionData(b.id);
			if (!aExec) return 1;
			if (!bExec) return -1;
			return new Date(bExec.executionTime).getTime() - new Date(aExec.executionTime).getTime();
		});

		const lastExecutedNode = sortedNodes[0];
		if (lastExecutedNode) {
			const executionData = workflowStore.getNodeExecutionData(lastExecutedNode.id);
			if (executionData?.data?.length) {
				return executionData.data[0];
			}
		}
	}

	return null;
});

const inputDataStatus = computed(() => {
	if (isFirstNode.value) return 'idle' as const;

	const previousNodeName = findPreviousConnectedNode(props.nodeId);
	if (!previousNodeName) return 'idle' as const;

	const previousNode = workflowStore.nodes.find((n) => n.name === previousNodeName);
	if (!previousNode) return 'idle' as const;

	const executionData = workflowStore.getNodeExecutionData(previousNode.id);
	return executionData?.status || ('idle' as const);
});

// Get current node output data
const outputData = computed(() => {
	const executionData = workflowStore.getNodeExecutionData(currentNodeId.value);
	if (executionData?.data?.length) {
		return executionData.data[0];
	}

	return null;
});

const outputDataStatus = computed(() => {
	const executionData = workflowStore.getNodeExecutionData(currentNodeId.value);
	return executionData?.status || ('idle' as const);
});

// Helper to find previous connected node
function findPreviousConnectedNode(nodeId?: string): string | null {
	if (!nodeId || !workflowStore.currentWorkflow) return null;

	const currentNode = workflowStore.nodes.find((n) => n.id === nodeId);
	if (!currentNode) return null;

	// Find connections pointing to this node
	for (const [sourceName, connections] of Object.entries(workflowStore.connections)) {
		const mainConnections = connections.main || [];
		for (const outputConnections of mainConnections) {
			if (outputConnections?.some((c) => c.node === currentNode.name)) {
				return sourceName;
			}
		}
	}

	return null;
}

// Dynamic component loading
const nodeConfigComponents: Record<string, any> = {
	postgres: defineAsyncComponent(() => import('./nodes/PostgresConfig.vue')),
	elasticsearch: defineAsyncComponent(() => import('./nodes/ElasticsearchConfig.vue')),
	schedule: defineAsyncComponent(() => import('./nodes/ScheduleConfig.vue')),
	code: defineAsyncComponent(() => import('./nodes/CodeConfig.vue')),
	loop: defineAsyncComponent(() => import('./nodes/LoopConfig.vue')),
};

const nodeConfigComponent = computed(() => {
	return nodeConfigComponents[props.nodeTemplate?.type];
});

const nodeIconMap: Record<string, any> = {
	postgres: DatabaseOutlined,
	elasticsearch: SearchOutlined,
	transform: SwapOutlined,
	if: BranchesOutlined,
	switch: SplitCellsOutlined,
	loop: SyncOutlined,
	schedule: ClockCircleOutlined,
	code: CodeOutlined,
};

const nodeColorMap: Record<string, string> = {
	postgres: '#336791',
	elasticsearch: '#00bfb3',
	transform: '#ff5b00',
	if: '#9254de',
	switch: '#722ed1',
	loop: '#eb6f00',
	schedule: '#13c2c2',
	code: '#ff6600',
};

const nodeIcon = computed(() => nodeIconMap[props.nodeTemplate?.type || ''] || DatabaseOutlined);
const nodeColor = computed(() => nodeColorMap[props.nodeTemplate?.type || ''] || '#666');
const modalTitle = computed(() => {
	if (props.nodeTemplate?.type === 'postgres') return 'Execute a SQL query';
	if (props.nodeTemplate?.type === 'elasticsearch') return 'Execute a search query';
	if (props.nodeTemplate?.type === 'schedule') return 'Schedule Trigger';
	if (props.nodeTemplate?.type === 'code') return 'Code in JavaScript';
	if (props.nodeTemplate?.type === 'loop') return 'Loop Over Items';
	return props.nodeTemplate?.displayName || '';
});

const isFirstNode = computed(() => {
	// First node is trigger node (schedule, webhook, etc.)
	const triggerTypes = ['schedule', 'webhook', 'manual'];
	return triggerTypes.includes(props.nodeTemplate?.type || '');
});

watch(
	() => props.visible,
	(newVal) => {
		if (newVal && props.nodeTemplate) {
			nodeName.value = `${props.nodeTemplate.displayName} ${workflowStore.nodes.length + 1}`;
			nodeParameters.value = {};
		}
	},
);

function handleCancel() {
	emit('update:visible', false);
}

function handleSave() {
	const newNodeId = `node-${Date.now()}`;
	const newNode = {
		id: newNodeId,
		name: nodeName.value,
		type: props.nodeTemplate.type,
		typeVersion: 1,
		position: [300 + workflowStore.nodes.length * 80, 200] as [number, number],
		parameters: {
			...nodeParameters.value,
			notes: notes.value,
			continueOnFail: continueOnFail.value,
		},
	};
	// If this was a temp node with execution results, transfer them to the new ID
	if (!props.nodeId) {
		const tempId = currentNodeId.value;
		const tempExecutionData = workflowStore.getNodeExecutionData(tempId);
		if (tempExecutionData) {
			workflowStore.setExecutionResult(newNodeId, {
				...tempExecutionData,
				nodeId: newNodeId,
			});
			workflowStore.clearExecutionResult(tempId);
		}
	}

	emit('save', newNode);
	emit('update:visible', false);
}

function handleExecuteStep() {
	message.loading({
		content: 'Executing node...',
		key: 'execute',
		duration: 0,
	});

	// Simulate execution (replace with actual API call)
	setTimeout(() => {
		try {
			// Mock execution result
			const mockResult = {
				timestamp: new Date().toISOString(),
				'Readable date': new Date().toLocaleString(),
				'Day of week': new Intl.DateTimeFormat('en-US', {
					weekday: 'long',
				}).format(new Date()),
				Year: new Date().getFullYear(),
				Month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()),
				'Day of month': new Date().getDate(),
				Hour: new Date().getHours(),
				Minute: new Date().getMinutes(),
				Second: new Date().getSeconds(),
				Timezone: 'America/New_York (UTC-05:00)',
			};

			workflowStore.setExecutionResult(currentNodeId.value, {
				nodeId: currentNodeId.value,
				nodeName: nodeName.value,
				executionTime: new Date().toISOString(),
				status: 'success',
				data: [mockResult],
			});

			message.success({
				content: 'Node executed successfully',
				key: 'execute',
				duration: 2,
			});
		} catch (error) {
			message.error({
				content: 'Execution failed',
				key: 'execute',
				duration: 2,
			});

			workflowStore.setExecutionResult(currentNodeId.value, {
				nodeId: currentNodeId.value,
				nodeName: nodeName.value,
				executionTime: new Date().toISOString(),
				status: 'error',
				data: [],
				error: String(error),
			});
		}
	}, 1000);
}

// Handle view changes
function handleInputViewChange(view: 'schema' | 'table' | 'json') {
	inputTab.value = view;
}

function handleOutputViewChange(view: 'schema' | 'table' | 'json') {
	outputTab.value = view;
}

// Handle field drag for mapping
function handleFieldDragStart() {
	// Drag data is already stored globally in SchemaFieldItem component
}

// Handle mock data saving
function handleSaveMockData(data: Record<string, any>) {
	workflowStore.setExecutionResult(currentNodeId.value, {
		nodeId: currentNodeId.value,
		nodeName: nodeName.value,
		executionTime: new Date().toISOString(),
		status: 'success',
		data: [data],
	});
	message.success('Mock data saved');
}
</script>

<style scoped lang="scss">
.node-config-modal {
	display: flex;
	height: 80vh;
	min-height: 500px;

	:deep(.ant-row) {
		width: 100%;
		height: 100%;
	}
}

.modal-column {
	height: 100%;
	border-right: 1px solid $color-border-light;

	&:last-child {
		border-right: none;
	}
}

.modal-section {
	display: flex;
	flex-direction: column;
	height: 100%;

	&.input-section,
	&.output-section {
		background: $color-bg-secondary;
	}

	&.config-section {
		background: $color-bg;
	}
}

.section-header {
	padding: $spacing-md;
	border-bottom: 1px solid $color-border-light;
	background: $color-bg;

	h4 {
		font-size: $font-size-xs;
		font-weight: $font-weight-semibold;
		color: $color-text-secondary;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0 0 $spacing-xs 0;
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: $spacing-sm;
		margin-bottom: 0;
		width: 100%;
		justify-content: space-between;

		h3 {
			font-size: $font-size-md;
			font-weight: $font-weight-semibold;
			margin: 0;
		}
	}
}

.section-content {
	flex: 1;
	padding: $spacing-lg;
	overflow-y: auto;
	text-align: center;
}

.placeholder-text {
	color: $color-text-secondary;
	font-size: $font-size-sm;
	margin: $spacing-xl 0 $spacing-xs 0;
}

.link-text {
	color: $color-primary;
	font-size: $font-size-sm;
	cursor: pointer;

	&:hover {
		text-decoration: underline;
	}
}

.config-content {
	padding: $spacing-md;
	overflow-y: auto;
	max-height: calc(80vh - 120px);
}

.config-tabs {
	:deep(.ant-tabs-nav) {
		padding: 0 $spacing-md;
		margin: 0;
	}
}

.form-help-text {
	font-size: $font-size-xs;
	color: $color-text-secondary;
	margin-top: $spacing-2xs;
}

.modal-footer {
	display: flex;
	justify-content: flex-end;
	gap: $spacing-sm;
}

// Override Ant Design modal styles
:deep(.ant-modal-content) {
	padding: 0;
}

:deep(.ant-modal-header) {
	padding: $spacing-md $spacing-lg;
	border-bottom: 1px solid $color-border;
}

:deep(.ant-modal-body) {
	padding: 0;
}

:deep(.ant-modal-footer) {
	padding: $spacing-md $spacing-lg;
	border-top: 1px solid $color-border;
}
</style>
