<template>
	<div class="workflow-canvas">
		<VueFlow
			v-model:nodes="flowNodes"
			v-model:edges="flowEdges"
			:node-types="nodeTypes"
			:edge-types="edgeTypes"
			:default-zoom="1"
			:min-zoom="0.1"
			:max-zoom="2"
			@nodes-change="handleNodesChange"
			@edges-change="handleEdgesChange"
			@connect="handleConnect"
			@node-click="handleNodeClick"
		>
			<Background pattern="dots" :pattern-color="'#aaa'" :gap="16" :size="1" />
			<Controls position="top-right">
				<ControlButton title="Add Node" @click="emit('openNodePalette')">
					<AppstoreAddOutlined />
				</ControlButton>
			</Controls>
			<MiniMap />
		</VueFlow>

		<div v-if="workflowStore.nodes.length === 0" class="empty-canvas">
			<div class="empty-content">
				<h2>Start Building Your Workflow</h2>
				<p>Add your first node from the right panel to get started</p>
				<a-button type="primary" size="large" @click="openFirstNodeModal">
					<PlusOutlined /> Add First Node
				</a-button>
			</div>
		</div>

		<!-- Execute Workflow Button -->
		<div v-if="workflowStore.nodes.length > 0" class="execute-button-container">
			<a-button
				type="primary"
				size="large"
				:loading="
					executionStore.currentExecutionId !== null &&
					executionStore.currentExecution?.status === 'running'
				"
				class="execute-button"
				@click="handleExecuteWorkflow"
			>
				<template #icon>
					<PlayCircleOutlined />
				</template>
				Execute Workflow
			</a-button>
		</div>

		<NodeConfigModal
			v-model:visible="modalVisible"
			:nodeTemplate="currentNodeTemplate"
			@save="handleNodeSave"
			@addNodeToEdge="handleEdgeAddNode"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls, ControlButton } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useExecutionStore } from '@/stores/executionStore';
import WorkflowNode from './WorkflowNode.vue';
import PlaceholderNode from './nodes/PlaceholderNode.vue';
import CustomEdge from './CustomEdge.vue';
import NodeConfigModal from './NodeConfigModal.vue';
import { PlusOutlined, PlayCircleOutlined, AppstoreAddOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { Node, Edge } from '@vue-flow/core';

import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

const workflowStore = useWorkflowStore();
const executionStore = useExecutionStore();

const emit = defineEmits<{
	(e: 'openNodePalette'): void;
}>();

// Initialize workflow if empty
if (!workflowStore.currentWorkflow) {
	workflowStore.initializeWorkflow();
}

const nodeTypes = {
	custom: WorkflowNode,
	placeholder: PlaceholderNode,
};

const edgeTypes = {
	custom: CustomEdge,
};

const modalVisible = ref(false);
const insertEdgeData = ref<{ sourceId: string; targetId: string } | null>(null);
const placeholderSourceId = ref<string | null>(null); // Track which node the placeholder belongs to
const selectedTemplate = ref<any>(null); // Template selected from palette

const firstNodeTemplate = {
	type: 'schedule',
	displayName: 'Schedule',
	description: 'Trigger workflow on a schedule',
	color: '#13c2c2',
};

const currentNodeTemplate = computed(() => {
	// If we have a selected template from palette, use it
	if (selectedTemplate.value) {
		return selectedTemplate.value;
	}
	// If inserting between nodes, use transform as default
	if (insertEdgeData.value) {
		return {
			type: 'transform',
			displayName: 'Transform',
			description: 'Transform data',
			color: '#ff5b00',
		};
	}
	// Otherwise use first node template
	return firstNodeTemplate;
});

// Convert store nodes to Vue Flow nodes
const flowNodes = computed<Node[]>({
	get: () => {
		const nodes: Node[] = [];

		workflowStore.nodes.forEach((node) => {
			// Add the actual node
			nodes.push({
				id: node.id,
				type: 'custom',
				position: { x: node.position[0], y: node.position[1] },
				data: node,
				sourcePosition: 'right' as const,
				targetPosition: 'left' as const,
			});

			// Add a placeholder node to the right of this node
			// Only if this node doesn't already have an outgoing connection
			const hasOutgoingConnection = workflowStore.connections[node.name]?.main?.some(
				(conns: any) => conns && conns.length > 0,
			);

			if (!hasOutgoingConnection) {
				nodes.push({
					id: `placeholder-${node.id}`,
					type: 'placeholder',
					position: {
						x: node.position[0] + 280, // Position to the right
						y: node.position[1],
					},
					data: {
						sourceNodeId: node.id,
						isPlaceholder: true,
					},
					sourcePosition: 'right' as const,
					targetPosition: 'left' as const,
				});
			}
		});

		return nodes;
	},
	set: (newNodes) => {
		// Update is handled by handleNodesChange
	},
});

// Convert store connections to Vue Flow edges
const flowEdges = computed<Edge[]>({
	get: () => {
		const edges: Edge[] = [];

		// Regular connections between nodes
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
						animated: true,
						markerEnd: 'arrowclosed',
						style: { stroke: '#ff5b00', strokeWidth: 2 },
					});
				});
			});
		}

		// Add edges to placeholder nodes
		workflowStore.nodes.forEach((node) => {
			const hasOutgoingConnection = workflowStore.connections[node.name]?.main?.some(
				(conns: any) => conns && conns.length > 0,
			);

			if (!hasOutgoingConnection) {
				edges.push({
					id: `${node.id}-placeholder`,
					source: node.id,
					target: `placeholder-${node.id}`,
					type: 'default',
					animated: false,
					markerEnd: 'arrowclosed',
					style: {
						stroke: '#ddd',
						strokeWidth: 2,
						strokeDasharray: '5,5',
					},
				});
			}
		});

		return edges;
	},
	set: (newEdges) => {
		// Update is handled by handleEdgesChange
	},
});

function handleNodesChange(changes: any[]) {
	changes.forEach((change) => {
		if (change.type === 'position' && change.position && !change.dragging) {
			workflowStore.updateNode(change.id, {
				position: [Math.round(change.position.x), Math.round(change.position.y)],
			});
		}
	});
}

function handleEdgesChange(changes: any[]) {
	// Handle edge deletions, etc.
}

function handleConnect(params: any) {
	const sourceNode = workflowStore.nodes.find((n) => n.id === params.source);
	const targetNode = workflowStore.nodes.find((n) => n.id === params.target);

	if (sourceNode && targetNode) {
		workflowStore.addConnection(sourceNode.name, 0, targetNode.name, 0);
	}
}

function handleNodeClick(event: any) {
	const nodeData = event.node.data;

	// Check if it's a placeholder node
	if (nodeData.isPlaceholder) {
		placeholderSourceId.value = nodeData.sourceNodeId;
		emit('openNodePalette');
	} else {
		workflowStore.setSelectedNode(nodeData.id);
	}
}

function openFirstNodeModal() {
	modalVisible.value = true;
}

function handleNodeSave(nodeData: any) {
	if (insertEdgeData.value) {
		// Insert node between two existing nodes
		const sourceNode = workflowStore.nodes.find((n) => n.id === insertEdgeData.value!.sourceId);
		const targetNode = workflowStore.nodes.find((n) => n.id === insertEdgeData.value!.targetId);

		if (sourceNode && targetNode) {
			// Position new node between source and target
			const midX = (sourceNode.position[0] + targetNode.position[0]) / 2;
			const midY = (sourceNode.position[1] + targetNode.position[1]) / 2;

			nodeData.position = [Math.round(midX), Math.round(midY)];

			// Remove old connection
			workflowStore.removeConnection(sourceNode.name, 0, targetNode.name, 0);

			// Add new node
			workflowStore.addNode(nodeData);

			// Create new connections immediately: source -> new node -> target
			workflowStore.addConnection(sourceNode.name, 0, nodeData.name, 0);
			workflowStore.addConnection(nodeData.name, 0, targetNode.name, 0);
		}

		insertEdgeData.value = null;
	} else if (placeholderSourceId.value) {
		// Node created from placeholder - position it where placeholder was
		const sourceNode = workflowStore.nodes.find((n) => n.id === placeholderSourceId.value);

		if (sourceNode) {
			nodeData.position = [sourceNode.position[0] + 280, sourceNode.position[1]];

			// Add new node
			workflowStore.addNode(nodeData);

			// Connect source to new node immediately
			workflowStore.addConnection(sourceNode.name, 0, nodeData.name, 0);
		}

		placeholderSourceId.value = null;
	} else {
		// Regular node addition
		workflowStore.addNode(nodeData);
	}

	// Clear template selection and placeholder reference
	selectedTemplate.value = null;
	placeholderSourceId.value = null;
}

function handleEdgeAddNode(sourceId: string, targetId: string) {
	insertEdgeData.value = { sourceId, targetId };
	modalVisible.value = true;
}

// Handle node selection from palette
function handleNodeSelected(nodeTemplate: any) {
	selectedTemplate.value = nodeTemplate;
	modalVisible.value = true;
}

// Provide placeholder context to child components (like NodePalette)
provide('placeholderContext', {
	getPlaceholderSourceId: () => placeholderSourceId.value,
	clearPlaceholderSource: () => {
		placeholderSourceId.value = null;
	},
});

// Execute workflow
async function handleExecuteWorkflow() {
	if (!workflowStore.currentWorkflow) {
		message.error('No workflow to execute');
		return;
	}

	if (workflowStore.nodes.length === 0) {
		message.warning('Workflow has no nodes to execute');
		return;
	}

	try {
		await executionStore.executeWorkflow(
			workflowStore.currentWorkflow.id,
			workflowStore.nodes,
			workflowStore.connections,
		);

		message.success('Workflow executed successfully');
	} catch (error) {
		message.error('Workflow execution failed');
		console.error('Execution error:', error);
	}
}

// Expose methods for parent component
defineExpose({
	handleNodeSelected,
});
</script>

<style scoped lang="scss">
.workflow-canvas {
	flex: 1;
	position: relative;
	background: $color-bg-canvas;
}

.empty-canvas {
	position: absolute;
	inset: 0;
	@include flex-center;
	pointer-events: none;
	z-index: 1;
}

.empty-content {
	text-align: center;
	padding: $spacing-2xl;
	background: rgba(255, 255, 255, 0.9);
	border-radius: $radius-xl;
	box-shadow: $shadow-lg;
	pointer-events: auto;

	h2 {
		font-size: $font-size-3xl;
		font-weight: $font-weight-bold;
		color: $color-text;
		margin-bottom: $spacing-sm;
	}

	p {
		font-size: $font-size-lg;
		color: $color-text-secondary;
		margin-bottom: $spacing-xl;
	}
}

// Vue Flow customization
:deep(.vue-flow__background) {
	background-color: $color-bg-canvas;
}

:deep(.vue-flow__minimap) {
	background-color: $color-bg;
	border: 1px solid $color-border;
}

:deep(.vue-flow__controls) {
	top: $spacing-md !important;
	right: $spacing-md !important;
	left: auto !important;
	bottom: auto !important;
	box-shadow: none;

	.vue-flow__controls-button {
		width: 36px;
		height: 36px;
		@include flex-center;
		background: white;
		color: $color-text;
		border: 1px solid $color-border;
		border-radius: $radius-lg;
		cursor: pointer;
		box-shadow: $shadow-sm;
		transition: all $transition-normal;
		margin: $spacing-xs 0;

		svg {
			fill: $color-text;
			width: 18px;
			height: 18px;
			max-width: 18px;
			max-height: 18px;
		}

		&:hover {
			background: $color-bg-hover;
			border-color: $color-primary;
			color: $color-primary;
			box-shadow: $shadow-md;
			transform: scale(1.1);
			svg {
				fill: $color-primary-hover;
			}
		}

		&:first-child {
			margin-top: 0;
		}

		&:last-child {
			margin-bottom: 0;
			background: $color-primary;
			color: white;
			border-color: $color-primary;

			svg {
				fill: white;
			}

			&:hover {
				background: $color-primary-hover;
				border-color: $color-primary-hover;
				color: white;
				svg {
					fill: white;
				}
			}
		}
	}
}

:deep(.vue-flow__edge) {
	&.selected {
		.vue-flow__edge-path {
			stroke: $color-primary !important;
		}
	}
}

// Custom arrow markers
:deep(.vue-flow__edge-marker) {
	path {
		fill: #ff5b00;
		stroke: #ff5b00;
	}
}

// Style for animated edges
:deep(.vue-flow__edge.animated) {
	.vue-flow__edge-path {
		stroke-dasharray: 5;
		animation: dashdraw 0.5s linear infinite;
	}
}

@keyframes dashdraw {
	0% {
		stroke-dashoffset: 10;
	}
	100% {
		stroke-dashoffset: 0;
	}
}

// Execute button
.execute-button-container {
	position: fixed;
	bottom: $spacing-2xl;
	left: 50%;
	transform: translateX(-50%);
	z-index: $z-fixed;
	pointer-events: none;
}

.execute-button {
	pointer-events: auto;
	height: 48px;
	padding: 0 $spacing-2xl;
	font-size: $font-size-lg;
	font-weight: $font-weight-semibold;
	border-radius: $radius-full;
	box-shadow: $shadow-xl;
	transition: all $transition-normal;

	&:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 20px 56px rgba(0, 0, 0, 0.2);
	}

	&:active:not(:disabled) {
		transform: translateY(0);
	}
}
</style>
