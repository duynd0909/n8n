<template>
	<a-config-provider :theme="themeConfig">
		<div class="martgen-app">
			<TopBar @tab-change="handleTabChange" />
			<div class="app-main">
				<!-- <LeftSidebar /> -->
				<WorkflowEditor
					ref="workflowEditorRef"
					:active-tab="currentTab"
					@open-node-palette="handleOpenPalette"
				/>
				<RightPanel ref="rightPanelRef" @nodeSelected="handleNodeSelected" />
			</div>
		</div>
	</a-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { themeConfig } from './theme/config';
import TopBar from './components/layout/TopBar.vue';
import LeftSidebar from './components/layout/LeftSidebar.vue';
import RightPanel from './components/layout/RightPanel.vue';
import WorkflowEditor from './components/workflow/WorkflowEditor.vue';

const rightPanelRef = ref<InstanceType<typeof RightPanel>>();
const workflowEditorRef = ref<InstanceType<typeof WorkflowEditor>>();
const currentTab = ref('Editor');

function handleOpenPalette() {
	rightPanelRef.value?.openPanel();
}

function handleNodeSelected(nodeTemplate: any) {
	console.log(nodeTemplate);
	workflowEditorRef.value?.handleNodeSelected(nodeTemplate);
}

function handleTabChange(tab: string) {
	currentTab.value = tab;
}
</script>

<style scoped lang="scss">
.martgen-app {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: $color-bg-secondary;
}

.app-main {
	flex: 1;
	display: flex;
	overflow: hidden;
}
</style>
