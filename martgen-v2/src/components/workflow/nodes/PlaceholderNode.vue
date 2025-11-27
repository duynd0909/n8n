<template>
	<div class="placeholder-node" @click="handleClick">
		<Handle type="target" :position="Position.Left" />
		<div class="placeholder-content">
			<PlusOutlined />
		</div>
	</div>
</template>

<script setup lang="ts">
import { PlusOutlined } from '@ant-design/icons-vue';
import { Handle, Position } from '@vue-flow/core';

interface Props {
	id: string;
	data: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	(e: 'click', nodeId: string): void;
}>();

function handleClick() {
	emit('click', props.id);
}
</script>

<style scoped lang="scss">
.placeholder-node {
	width: 80px;
	height: 80px;
	border: 2px dashed $color-border;
	border-radius: $radius-lg;
	background: $color-bg;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all $transition-normal;
	position: relative;

	&:hover {
		border-color: $color-primary;
		background: $color-primary-bg;
		transform: scale(1.05);

		.placeholder-content {
			color: $color-primary;
			transform: scale(1.1);
		}
	}
}

.placeholder-content {
	font-size: 32px;
	color: $color-text-secondary;
	transition: all $transition-normal;
}

// Vue Flow handle
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
</style>
