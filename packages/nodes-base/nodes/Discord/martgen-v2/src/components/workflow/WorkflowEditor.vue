<template>
	<div class="workflow-editor">
		<!-- Editor Tab -->
		<div v-show="activeTab === 'Editor'" class="tab-content">
			<WorkflowCanvas ref="workflowCanvasRef" @open-node-palette="emit('openNodePalette')" />
			<ExecutionLog v-if="executionStore.executionLogs.length > 0" />
		</div>

		<!-- Executions Tab -->
		<div v-show="activeTab === 'Executions'" class="tab-content">
			<ExecutionsView />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useExecutionStore } from '@/stores/executionStore';
import WorkflowCanvas from './WorkflowCanvas.vue';
import ExecutionLog from './ExecutionLog.vue';
import ExecutionsView from './ExecutionsView.vue';

const executionStore = useExecutionStore();

const emit = defineEmits<{
	(e: 'openNodePalette'): void;
}>();

const props = defineProps<{
	activeTab: string;
}>();

const activeTab = ref(props.activeTab);

// Watch for prop changes from TopBar
watch(
	() => props.activeTab,
	(newValue) => {
		activeTab.value = newValue;
	},
);

const workflowCanvasRef = ref<InstanceType<typeof WorkflowCanvas>>();

// Expose methods for parent component
function handleNodeSelected(nodeTemplate: any) {
	workflowCanvasRef.value?.handleNodeSelected(nodeTemplate);
}

defineExpose({
	handleNodeSelected,
});
</script>

<style scoped lang="scss">
.workflow-editor {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background: $color-bg-canvas;
}

.tab-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	position: relative;
}
</style>
