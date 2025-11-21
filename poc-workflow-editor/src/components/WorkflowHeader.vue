<template>
  <div class="workflow-header">
    <!-- Left section -->
    <div class="header-left">
      <a-breadcrumb class="breadcrumb">
        <a-breadcrumb-item>Workflows</a-breadcrumb-item>
        <a-breadcrumb-item>
          <span
            v-if="!isEditingName"
            class="workflow-name"
            @click="startEditName"
          >
            {{ workflowName }}
            <EditOutlined class="edit-icon" />
          </span>
          <a-input
            v-else
            ref="nameInputRef"
            v-model:value="editedName"
            size="small"
            class="name-input"
            @blur="saveName"
            @pressEnter="saveName"
          />
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <!-- Middle section - Tabs -->
    <div class="header-tabs">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'editor' }"
        @click="handleTabChange('editor')"
      >
        Editor
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'executions' }"
        @click="handleTabChange('executions')"
      >
        Executions
      </div>
    </div>

    <!-- Right section -->
    <div class="header-right">
      <div class="status-toggle" @click="toggleActive">
        <span class="status-dot" :class="{ active: isActive }"></span>
        <span class="status-text">{{ isActive ? 'Active' : 'Inactive' }}</span>
      </div>

      <a-button
        :type="isDirty ? 'primary' : 'default'"
        :disabled="!isDirty"
        class="save-btn"
        @click="$emit('save')"
      >
        <SaveOutlined />
        Save
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { EditOutlined, SaveOutlined } from '@ant-design/icons-vue';

const props = withDefaults(defineProps<{
  activeTab?: 'editor' | 'executions';
}>(), {
  activeTab: 'editor',
});

const emit = defineEmits<{
  'update:activeTab': [tab: 'editor' | 'executions'];
  save: [];
  updateName: [name: string];
}>();

const workflowName = ref('My Workflow');
const isActive = ref(true);
const isDirty = ref(false);
const isEditingName = ref(false);
const editedName = ref(workflowName.value);
const nameInputRef = ref<HTMLInputElement | null>(null);

function handleTabChange(tab: 'editor' | 'executions') {
  emit('update:activeTab', tab);
}

function toggleActive() {
  isActive.value = !isActive.value;
}

function startEditName() {
  editedName.value = workflowName.value;
  isEditingName.value = true;
  nextTick(() => {
    nameInputRef.value?.focus();
  });
}

function saveName() {
  if (editedName.value.trim()) {
    workflowName.value = editedName.value.trim();
    isDirty.value = true;
  }
  isEditingName.value = false;
}
</script>

<style lang="scss" scoped>
.workflow-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb {
  font-size: 14px;
}

.workflow-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #F3F4F6;

    .edit-icon {
      opacity: 1;
    }
  }
}

.edit-icon {
  font-size: 12px;
  color: #6B7280;
  opacity: 0;
  transition: opacity 0.2s;
}

.name-input {
  width: 200px;
}

.header-tabs {
  display: flex;
  gap: 8px;
}

.tab-item {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    color: #111827;
    background: #F3F4F6;
  }

  &.active {
    color: #FF8A3D;
    background: rgba(255, 138, 61, 0.1);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #F3F4F6;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #E5E7EB;
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6B7280;

  &.active {
    background: #2EAD5F;
  }
}

.status-text {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}

.save-btn {
  &.ant-btn-primary {
    background: #FF8A3D;
    border-color: #FF8A3D;

    &:hover {
      background: #E67428;
      border-color: #E67428;
    }
  }

  &:disabled {
    background: transparent;
    border-color: #E5E7EB;
    color: #9CA3AF;
  }
}
</style>
