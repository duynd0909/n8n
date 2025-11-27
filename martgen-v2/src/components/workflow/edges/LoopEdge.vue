<template>
	<g>
		<!-- The loop path -->
		<path
			:id="id"
			class="vue-flow__edge-path loop-edge-path"
			:d="path"
			:marker-end="markerEnd"
			:style="edgeStyle"
		/>

		<!-- Label for the loop edge -->
		<foreignObject
			v-if="label"
			:x="labelX"
			:y="labelY"
			width="60"
			height="24"
			class="edge-label-wrapper"
		>
			<div class="edge-label">
				{{ label }}
			</div>
		</foreignObject>

		<!-- Add button in the middle of the edge -->
		<foreignObject
			:x="buttonX - 15"
			:y="buttonY - 15"
			width="30"
			height="30"
			class="edge-button-wrapper"
			@click.stop="handleAddClick"
		>
			<a-button type="primary" size="small" :icon="h(PlusOutlined)" />
		</foreignObject>
	</g>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { EdgeProps, getSmoothStepPath } from '@vue-flow/core';
import { PlusOutlined } from '@ant-design/icons-vue';

interface Props extends EdgeProps {}

const props = defineProps<Props>();

const emit = defineEmits<{
	(e: 'addNode', sourceId: string, targetId: string): void;
}>();

// Calculate the loop-back path using smooth step
// This creates a nice curved path that goes back to the node
const pathData = computed(() => {
	// For self-loop, we need to create a path that goes out and comes back
	const offset = 80; // How far out the loop extends
	const source = props.sourceNode;
	const centerX = (props.sourceX + props.targetX) / 2;
	const centerY = props.sourceY + 40 + source.dimensions.height / 2;
	return getSmoothStepPath({
		sourceX: props.sourceX,
		sourceY: props.sourceY,
		sourcePosition: props.sourcePosition,
		targetX: props.targetX,
		targetY: props.targetY,
		centerX,
		centerY,
		targetPosition: props.targetPosition,
		borderRadius: 12,
		offset: offset,
	});
});

const path = computed(() => pathData.value[0]);
const buttonX = computed(() => pathData.value[1]);
const buttonY = computed(() => pathData.value[2]);

// Position label near the source handle (to the right)
const labelX = computed(() => props.sourceX + 10);
const labelY = computed(() => props.sourceY - 12);

const edgeStyle = computed(() => ({
	stroke: '#fa8c16',
	strokeWidth: 2,
	...props.style,
}));

function handleAddClick() {
	emit('addNode', props.source, props.target);
}
</script>

<style scoped lang="scss">
.loop-edge-path {
	transition: stroke 0.2s;

	&:hover {
		stroke: #ff9c3a;
		stroke-width: 3;
	}
}

.edge-label-wrapper {
	pointer-events: none;
	overflow: visible;
}

.edge-label {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 11px;
	font-weight: 600;
	color: #595959;
	background: rgba(255, 255, 255, 0.95);
	padding: 3px 8px;
	border-radius: 4px;
	white-space: nowrap;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
	border: 1px solid #fa8c16;
}

.edge-button-wrapper {
	pointer-events: all;
	overflow: visible;
}
</style>
