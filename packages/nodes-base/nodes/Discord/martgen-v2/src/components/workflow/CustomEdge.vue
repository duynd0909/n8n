<template>
	<g>
		<!-- The main edge path -->
		<path
			:id="id"
			class="vue-flow__edge-path"
			:d="path"
			:marker-end="markerEnd"
			:style="edgeStyle"
		/>

		<!-- Add button in the middle of the edge -->
		<foreignObject
			:x="edgeCenterX - 25"
			:y="edgeCenterY - 15"
			width="50"
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
import { EdgeProps, getBezierPath } from '@vue-flow/core';
import { PlusOutlined } from '@ant-design/icons-vue';

interface Props extends EdgeProps {}

const props = defineProps<Props>();

const emit = defineEmits<{
	(e: 'addNode', sourceId: string, targetId: string): void;
}>();

// Calculate the edge path
const pathData = computed(() => {
	return getBezierPath({
		sourceX: props.sourceX,
		sourceY: props.sourceY,
		sourcePosition: props.sourcePosition,
		targetX: props.targetX,
		targetY: props.targetY,
		targetPosition: props.targetPosition,
	});
});

const path = computed(() => pathData.value[0]);
const edgeCenterX = computed(() => pathData.value[1]);
const edgeCenterY = computed(() => pathData.value[2]);

const edgeStyle = computed(() => ({
	stroke: '#ff5b00',
	strokeWidth: 2,
	...props.style,
}));

function handleAddClick() {
	emit('addNode', props.source, props.target);
}
</script>

<style scoped lang="scss">
.edge-button-wrapper {
	pointer-events: all;
	overflow: visible;
}

.edge-add-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
	background: white;
	border: 1px solid $color-border;
	border-radius: $radius-sm;
	padding: 4px;
	font-size: $font-size-xs;
	color: $color-text;
	cursor: pointer;
	box-shadow: $shadow-sm;
	transition: all $transition-fast;
	white-space: nowrap;

	&:hover {
		background: $color-primary;
		color: white;
		border-color: $color-primary;
		box-shadow: $shadow-md;
		transform: scale(1.05);
	}

	span {
		font-weight: $font-weight-medium;
	}
}

.vue-flow__edge-path {
	transition: stroke $transition-fast;

	&:hover {
		stroke: $color-primary-hover;
		stroke-width: 3;
	}
}
</style>
