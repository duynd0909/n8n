<template>
  <div class="node-panel-overlay" @click.self="$emit('close')">
    <div class="node-panel">
      <div class="panel-header">
        <div class="header-content">
          <h3 class="panel-title">What triggers this workflow?</h3>
          <p class="panel-subtitle">A trigger is a step that starts your workflow</p>
        </div>
        <a-button type="text" class="close-btn" @click="$emit('close')">
          <CloseOutlined />
        </a-button>
      </div>

      <div class="search-box">
        <a-input
          ref="searchInputRef"
          v-model:value="searchQuery"
          placeholder="Search..."
          size="large"
        >
          <template #prefix>
            <SearchOutlined style="color: #9CA3AF" />
          </template>
          <template #suffix v-if="searchQuery">
            <CloseCircleOutlined style="color: #9CA3AF; cursor: pointer" @click="searchQuery = ''" />
          </template>
        </a-input>
      </div>

      <div class="node-list">
        <!-- All nodes in flat list for n8n style -->
        <div
          v-for="node in filteredNodes"
          :key="node.name"
          class="node-item"
          draggable="true"
          @dragstart="onDragStart($event, node)"
          @click="addNode(node)"
        >
          <div class="node-icon" :style="{ backgroundColor: node.color + '15', color: node.color }">
            <component :is="getIcon(node.icon)" />
          </div>
          <div class="node-info">
            <span class="node-name">{{ node.displayName }}</span>
            <span class="node-desc" v-if="node.description">{{ node.description }}</span>
          </div>
          <RightOutlined class="node-arrow" />
        </div>

        <div v-if="filteredNodes.length === 0" class="empty-state">
          <p>No nodes found for "{{ searchQuery }}"</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  CloseOutlined,
  SearchOutlined,
  CloseCircleOutlined,
  RightOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  SwapOutlined,
  BranchesOutlined,
  ApartmentOutlined,
} from '@ant-design/icons-vue';
import { useWorkflowStore } from '@/stores/workflowStore';
import { NODE_TYPES, type INodeTypeDescription, type INode } from '@/types/workflow';

const emit = defineEmits<{
  close: [];
}>();

const store = useWorkflowStore();
const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);

const allNodes = computed(() => Object.values(NODE_TYPES));

const filteredNodes = computed(() => {
  if (!searchQuery.value) return allNodes.value;
  const query = searchQuery.value.toLowerCase();
  return allNodes.value.filter(
    (n) =>
      n.displayName.toLowerCase().includes(query) ||
      n.description.toLowerCase().includes(query)
  );
});

const iconMap: Record<string, unknown> = {
  ClockCircleOutlined,
  DatabaseOutlined,
  SearchOutlined,
  SwapOutlined,
  BranchesOutlined,
  ApartmentOutlined,
};

function getIcon(iconName: string) {
  return iconMap[iconName] || DatabaseOutlined;
}

function onDragStart(event: DragEvent, node: INodeTypeDescription) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/nodeType', JSON.stringify(node));
    event.dataTransfer.effectAllowed = 'move';
  }
}

function addNode(nodeType: INodeTypeDescription) {
  const existingCount = store.nodes.filter((n) => n.type === nodeType.name).length;
  const newNode: INode = {
    id: `node-${Date.now()}`,
    name: `${nodeType.displayName}${existingCount > 0 ? ` ${existingCount + 1}` : ''}`,
    type: nodeType.name,
    typeVersion: 1,
    position: [300 + store.nodes.length * 250, 200],
    parameters: {},
  };
  store.addNode(newNode);
  emit('close');
}

onMounted(() => {
  // Auto-focus search input
  setTimeout(() => {
    searchInputRef.value?.focus();
  }, 100);
});
</script>

<style lang="scss" scoped>
.node-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.node-panel {
  width: 340px;
  height: 100%;
  background: #fff;
  border-left: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #E5E7EB;
}

.header-content {
  flex: 1;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px;
}

.panel-subtitle {
  font-size: 13px;
  color: #6B7280;
  margin: 0;
}

.close-btn {
  color: #6B7280;
  margin: -8px -8px 0 0;

  &:hover {
    color: #111827;
  }
}

.search-box {
  padding: 12px 16px;
  border-bottom: 1px solid #E5E7EB;
}

.node-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #F3F4F6;

  &:hover {
    background: #F9FAFB;

    .node-arrow {
      opacity: 1;
    }
  }

  &:active {
    background: #F3F4F6;
  }

  &:last-child {
    border-bottom: none;
  }
}

.node-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.node-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.node-desc {
  font-size: 12px;
  color: #6B7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-arrow {
  font-size: 12px;
  color: #9CA3AF;
  opacity: 0;
  transition: opacity 0.15s;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;

  p {
    color: #6B7280;
    font-size: 14px;
  }
}
</style>
