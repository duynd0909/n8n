<template>
	<div
		:class="['workflow-node-wrapper', { 'has-actions': showActions }]"
		@mouseenter="showActions = true"
		@mouseleave="showActions = false"
		@dblclick="openConfigModal"
	>
		<!-- Hover Actions -->
		<div v-if="showActions" class="node-actions">
			<a-tooltip title="Execute">
				<a-button
					size="small"
					type="text"
					:icon="h(PlayCircleOutlined)"
					@click.stop="handleExecute"
				/>
			</a-tooltip>
			<a-tooltip title="Delete">
				<a-button
					size="small"
					type="text"
					danger
					:icon="h(DeleteOutlined)"
					@click.stop="handleDelete"
				/>
			</a-tooltip>
			<a-tooltip title="Deactivate">
				<a-button
					size="small"
					type="text"
					:icon="h(PauseCircleOutlined)"
					@click.stop="handleToggleActive"
				/>
			</a-tooltip>
		</div>

		<div
			:class="[
				'workflow-node',
				`node-${data.type}`,
				{
					selected: isSelected,
					disabled: data.disabled,
					'is-trigger': isTriggerNode,
				},
			]"
			:style="executionBorderStyle"
		>
			<!-- Target handle - hidden for trigger nodes -->
			<Handle v-if="!isTriggerNode" type="target" :position="Position.Left" />

			<div class="node-content">
				<div class="node-icon-wrapper" :style="{ backgroundColor: nodeColor }">
					<component :is="nodeIcon" class="node-icon" />
				</div>

				<div v-if="executionStatus" :class="['node-status', `status-${executionStatus}`]">
					<CheckCircleOutlined v-if="executionStatus === 'success'" />
					<CloseCircleOutlined v-if="executionStatus === 'error'" />
					<LoadingOutlined v-if="executionStatus === 'running'" spin />
				</div>
			</div>

			<!-- Source handles - single or multiple based on node type -->
			<template v-if="hasMultipleOutputs">
				<div
					v-for="outputIndex in outputCount"
					:key="`output-${outputIndex - 1}`"
					:class="['output-handle-wrapper', `output-${outputIndex - 1}`]"
				>
					<Handle
						:id="`output-${outputIndex - 1}`"
						type="source"
						:position="Position.Right"
						:style="getOutputHandleStyle(outputIndex - 1)"
						:class="['custom-handle', `handle-output-${outputIndex - 1}`]"
					/>
				</div>
			</template>
			<Handle v-else type="source" :position="Position.Right" />
		</div>

		<!-- Node title below the node -->
		<div class="node-title">{{ data.name }}</div>

		<!-- Configuration Modal -->
		<NodeConfigModal
			v-model:visible="configModalVisible"
			:nodeTemplate="nodeTemplateForModal"
			:nodeId="data.id"
			@save="handleNodeUpdate"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, h } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useExecutionStore } from '@/stores/executionStore';
import { message } from 'ant-design-vue';
import NodeConfigModal from './NodeConfigModal.vue';
import { nodeTypeRegistry } from '@/types/nodeTypeRegistry';
import { DatabaseOutlined } from '@ant-design/icons-vue';
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	LoadingOutlined,
	PauseCircleOutlined,
	PlayCircleOutlined,
	DeleteOutlined,
} from '@ant-design/icons-vue';
import type { INode } from '@/types/workflow';

interface Props {
	id: string;
	data: INode;
}

const props = defineProps<Props>();
const workflowStore = useWorkflowStore();
const executionStore = useExecutionStore();

const showActions = ref(false);
const configModalVisible = ref(false);
const isSelected = computed(() => workflowStore.selectedNodeId === props.data.id);

// Get node metadata from registry
const nodeMetadata = computed(() => nodeTypeRegistry.get(props.data.type));

// Check if this is a trigger node (no incoming connections)
const isTriggerNode = computed(() => {
	return nodeMetadata.value?.group === 'trigger';
});

// Get execution status from store
const executionStatus = computed(() => {
	// Check if data has executionStatus (for read-only execution view)
	if ((props.data as any).executionStatus) {
		return (props.data as any).executionStatus;
	}

	// Otherwise get from execution store
	const status = executionStore.getNodeStatus(props.data.id);
	return status === 'pending' ? null : status;
});

// Multi-output support
const hasMultipleOutputs = computed(() => {
	return (nodeMetadata.value?.outputs.length ?? 1) > 1;
});

const outputCount = computed(() => {
	return nodeMetadata.value?.outputs.length ?? 1;
});

function getOutputName(index: number): string {
	return nodeMetadata.value?.outputs[index]?.displayName || `output ${index}`;
}

function getOutputHandleStyle(index: number) {
	const output = nodeMetadata.value?.outputs[index];
	if (!output) {
		return {
			top: '50%',
			backgroundColor: '#8c8c8c',
		};
	}

	return {
		top: `${50 + output.handleOffset}%`,
		backgroundColor: output.color,
	};
}

function getOutputLabelStyle(index: number) {
	const output = nodeMetadata.value?.outputs[index];
	if (!output) {
		return {
			top: '50%',
		};
	}

	return {
		top: `${50 + output.handleOffset}%`,
	};
}

const nodeIcon = computed(() => nodeMetadata.value?.icon || DatabaseOutlined);
const nodeColor = computed(() => nodeMetadata.value?.color || '#666');

// Execution border style (for read-only execution view)
const executionBorderStyle = computed(() => {
	const data = props.data as any;
	if (data.executionBorderColor && data.executionBorderWidth) {
		return {
			borderColor: data.executionBorderColor,
			borderWidth: `${data.executionBorderWidth}px`,
		};
	}
	return {};
});

const nodeTemplateForModal = computed(() => ({
	type: props.data.type,
	displayName: nodeMetadata.value?.displayName || props.data.type,
	description: '',
	color: nodeMetadata.value?.color || '#666',
}));

function handleExecute() {
	message.info(`Executing ${props.data.name}`);
}

function handleDelete() {
	workflowStore.removeNode(props.data.id);
	message.success(`Deleted ${props.data.name}`);
}

function handleToggleActive() {
	const newDisabledState = !props.data.disabled;
	workflowStore.updateNode(props.data.id, { disabled: newDisabledState });
	message.success(`${newDisabledState ? 'Deactivated' : 'Activated'} ${props.data.name}`);
}

function openConfigModal() {
	configModalVisible.value = true;
}

function handleNodeUpdate(nodeData: any) {
	// Update existing node instead of creating new one
	workflowStore.updateNode(props.data.id, {
		name: nodeData.name,
		parameters: nodeData.parameters,
	});
	message.success(`Updated ${nodeData.name}`);
}
</script>

<style scoped lang="scss">
.workflow-node-wrapper {
	position: relative;
	padding-top: 45px; // Space for action buttons

	&.has-actions {
		// Extend hover zone to include buttons
		&::before {
			content: '';
			position: absolute;
			top: -5px;
			left: -5px;
			right: -5px;
			bottom: -5px;
			pointer-events: auto;
		}
	}
}

.workflow-node {
	width: 120px;
	min-height: 60px;
	background: $color-bg;
	border: 1px solid $node-border-color;
	border-radius: $radius-node;
	box-shadow: $shadow-node;
	transition: all $transition-normal;
	cursor: pointer;
	position: relative;
	padding: $spacing-md;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	&:hover {
		box-shadow: $shadow-node-hover;
		transform: translateY(-1px);
	}

	&.selected {
		border-color: $color-info;
		border-width: 2px;
		box-shadow: $shadow-node-selected;
	}

	&.disabled {
		opacity: 0.6;
		background: $node-bg-disabled;
	}

	// Trigger nodes have more rounded left side
	&.is-trigger {
		border-top-left-radius: 20px;
		border-bottom-left-radius: 20px;
	}
}

.node-actions {
	position: absolute;
	top: 0;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	gap: $spacing-2xs;
	background: $color-bg;
	padding: $spacing-xs;
	border-radius: $radius-lg;
	box-shadow: $shadow-node-actions;
	z-index: 100;
	pointer-events: auto;

	:deep(.ant-btn) {
		display: flex;
		align-items: center;
		justify-content: center;

		&:hover {
			background: $node-action-bg-hover;
		}
	}
}

.node-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.node-icon-wrapper {
	width: 36px;
	height: 36px;
	border-radius: $radius-lg;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.node-icon {
	font-size: $font-size-2xl;
	color: $color-text-inverse;
}

.node-title {
	margin-top: $spacing-xs;
	font-size: $font-size-sm;
	font-weight: $font-weight-medium;
	color: $node-text-color;
	text-align: center;
	line-height: $line-height-tight;
	max-width: 140px; // Slightly wider than node for longer titles
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	word-break: break-word;
}

.node-status {
	position: absolute;
	top: $spacing-xs;
	right: $spacing-xs;
	width: 16px;
	height: 16px;
	border-radius: $radius-full;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: $font-size-3xs;

	&.status-success {
		color: $color-success;
	}

	&.status-error {
		color: $color-error;
	}

	&.status-running {
		color: $color-info;
	}
}

// Vue Flow handles
:deep(.vue-flow__handle) {
	width: 8px;
	height: 16px;
	background: $node-handle-color;
	border: 2px solid $color-bg;
	border-radius: 2px; // Rectangular with slight rounding
	transition: all $transition-normal;

	&:hover {
		background: $color-info;
		transform: scale(1.1);
	}

	&.source {
		right: -2px;
	}

	&.target {
		left: -2px;
	}
}

// Multiple output handles
.output-handle-wrapper {
	// position: absolute;
	// right: 0;
}

.custom-handle {
	border: 2px solid $color-bg;
	border-radius: 2px;
	transition: all $transition-normal;

	&:hover {
		transform: scale(1.2);
	}
}

.output-label {
	position: absolute;
	right: 18px;
	font-size: 10px;
	font-weight: 500;
	color: #595959;
	background: rgba(255, 255, 255, 0.95);
	padding: 2px 6px;
	border-radius: 4px;
	white-space: nowrap;
	transform: translateY(-50%);
	pointer-events: none;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
</style>
