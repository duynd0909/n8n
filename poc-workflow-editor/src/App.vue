<template>
  <a-config-provider :theme="themeConfig">
    <div class="app-layout">
      <!-- Left Sidebar -->
      <Sidebar />

      <!-- Main Content Area -->
      <div class="main-area">
        <!-- Workflow Header -->
        <WorkflowHeader v-model:activeTab="activeTab" />

        <!-- Editor Tab -->
        <div v-show="activeTab === 'editor'" class="canvas-area">
          <!-- Empty State or Canvas -->
          <EmptyState v-if="!hasNodes" @addTrigger="openNodePanel" />
          <WorkflowCanvas v-else @open-config="openNodeConfig" />

          <!-- Floating Add Node Button -->
          <a-button
            v-if="hasNodes"
            size="large"
            class="add-node-btn"
            @click="openNodePanel"
          >
            <PlusOutlined />
          </a-button>

          <!-- Floating Execute Button -->
          <a-button
            v-if="hasNodes"
            type="primary"
            size="large"
            class="execute-btn"
            @click="executeWorkflow"
          >
            <CaretRightOutlined />
            Execute
          </a-button>

          <!-- Logs Panel -->
          <LogsPanel v-if="hasNodes" />
        </div>

        <!-- Executions Tab -->
        <ExecutionsTab v-if="activeTab === 'executions'" />
      </div>

      <!-- Node Panel (slides from right) -->
      <NodePalette v-if="showNodePanel" @close="showNodePanel = false" />

      <!-- Node Config Modal -->
      <NodeConfigModal
        :node="configNode"
        @close="configNode = null"
        @save="handleNodeConfigSave"
      />
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { CaretRightOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { themeConfig } from './theme/config';
import { useWorkflowStore } from './stores/workflowStore';
import type { INode } from './types/workflow';
import Sidebar from './components/Sidebar.vue';
import WorkflowHeader from './components/WorkflowHeader.vue';
import EmptyState from './components/EmptyState.vue';
import WorkflowCanvas from './components/WorkflowCanvas.vue';
import LogsPanel from './components/LogsPanel.vue';
import NodePalette from './components/NodePalette.vue';
import NodeConfigModal from './components/NodeConfigModal.vue';
import ExecutionsTab from './components/ExecutionsTab.vue';

const store = useWorkflowStore();
const showNodePanel = ref(false);
const configNode = ref<INode | null>(null);
const activeTab = ref('editor');

const hasNodes = computed(() => store.nodes.length > 0);

function openNodePanel() {
  showNodePanel.value = true;
}

function openNodeConfig(node: INode) {
  configNode.value = node;
}

function handleNodeConfigSave(updates: Partial<INode>) {
  if (configNode.value) {
    store.updateNode(configNode.value.id, updates);
  }
}

function executeWorkflow() {
  console.log('Executing workflow...');
}
</script>

<style lang="scss" scoped>
.app-layout {
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.add-node-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 44px;
  height: 44px;
  padding: 0;
  font-size: 20px;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: #FF8A3D;
    color: #FF8A3D;
  }
}

.execute-btn {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  height: 44px;
  padding: 0 28px;
  font-size: 15px;
  font-weight: 500;
  background: #FF8A3D;
  border-color: #FF8A3D;
  border-radius: 22px;
  box-shadow: 0 4px 12px rgba(255, 138, 61, 0.4);

  &:hover {
    background: #E67428;
    border-color: #E67428;
  }
}
</style>
