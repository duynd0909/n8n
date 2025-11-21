<template>
  <div class="top-bar">
    <div class="left-section">
      <div class="logo">
        <span class="logo-icon">W</span>
        <span class="logo-text">Workflow Editor</span>
      </div>
    </div>

    <div class="center-section">
      <a-input
        v-model:value="workflowName"
        class="workflow-name-input"
        :bordered="false"
        @blur="updateName"
        @pressEnter="updateName"
      />
      <a-tag v-if="workflowStore.isDirty" color="orange">Unsaved</a-tag>
    </div>

    <div class="right-section">
      <a-space>
        <a-tooltip title="Save Workflow">
          <a-button @click="handleSave">
            <SaveOutlined />
            Save
          </a-button>
        </a-tooltip>

        <a-tooltip title="Execute Workflow">
          <a-button type="primary" @click="handleExecute">
            <PlayCircleOutlined />
            Execute
          </a-button>
        </a-tooltip>

        <a-switch
          :checked="workflowStore.currentWorkflow.active"
          checked-children="Active"
          un-checked-children="Inactive"
          @change="handleToggleActive"
        />
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { SaveOutlined, PlayCircleOutlined } from '@ant-design/icons-vue';
import { useWorkflowStore } from '@/stores/workflowStore';

const workflowStore = useWorkflowStore();
const workflowName = ref(workflowStore.currentWorkflow.name);

watch(
  () => workflowStore.currentWorkflow.name,
  (name) => {
    workflowName.value = name;
  }
);

function updateName() {
  if (workflowName.value !== workflowStore.currentWorkflow.name) {
    workflowStore.currentWorkflow.name = workflowName.value;
    workflowStore.isDirty = true;
  }
}

function handleSave() {
  // Simulate save
  message.success('Workflow saved successfully!');
  workflowStore.isDirty = false;
}

function handleExecute() {
  message.loading('Executing workflow...', 1.5).then(() => {
    message.success('Workflow executed successfully!');
  });
}

function handleToggleActive(checked: boolean) {
  workflowStore.currentWorkflow.active = checked;
  message.info(checked ? 'Workflow activated' : 'Workflow deactivated');
}
</script>

<style scoped>
.top-bar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid var(--color-border, #d9d9d9);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.left-section {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #ff5b00 0%, #e65200 100%);
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.logo-text {
  font-weight: 600;
  font-size: 16px;
  color: #262626;
}

.center-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.workflow-name-input {
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  max-width: 300px;
}

.workflow-name-input:hover {
  background: var(--color-bg-canvas, #f5f5f5);
  border-radius: 4px;
}

.right-section {
  display: flex;
  align-items: center;
}
</style>
