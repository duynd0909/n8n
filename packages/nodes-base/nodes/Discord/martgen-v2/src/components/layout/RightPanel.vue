<template>
	<div class="right-panel-wrapper">
		<!-- Overlay backdrop -->
		<div v-if="isPanelOpen" class="panel-backdrop" @click="closePanel" />

		<!-- Sliding panel -->
		<div :class="['right-panel', { open: isPanelOpen }]">
			<div class="panel-content">
				<NodePalette @closePanel="closePanel" @nodeSelected="handleNodeSelected" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NodePalette from '../workflow/NodePalette.vue';

const isPanelOpen = ref(false);

// Emit events to parent
const emit = defineEmits<{
	(e: 'nodeSelected', nodeTemplate: any): void;
}>();

function togglePanel() {
	isPanelOpen.value = !isPanelOpen.value;
}

function openPanel() {
	isPanelOpen.value = true;
}

function closePanel() {
	isPanelOpen.value = false;
}

function handleNodeSelected(nodeTemplate: any) {
	emit('nodeSelected', nodeTemplate);
}

// Expose functions for parent components
defineExpose({
	togglePanel,
	openPanel,
	closePanel,
});
</script>

<style scoped lang="scss">
.right-panel-wrapper {
	position: relative;
}

.panel-backdrop {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.3);
	z-index: $z-modal-backdrop;
	animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.right-panel {
	position: fixed;
	right: 0;
	top: $topbar-height;
	bottom: 0;
	width: $rightpanel-width;
	background: $color-bg;
	border-left: 1px solid $color-border;
	display: flex;
	flex-direction: column;
	z-index: $z-modal;
	transform: translateX(100%);
	transition: transform $transition-normal;
	box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);

	&.open {
		transform: translateX(0);
	}
}

.panel-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}
</style>
