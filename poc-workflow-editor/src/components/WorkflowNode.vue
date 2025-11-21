<template>
  <div
    class="workflow-node"
    :class="[`node-${props.data.type}`, { selected: props.selected, disabled: props.data.disabled }]"
  >
    <!-- Hover Toolbar -->
    <div class="node-toolbar" v-show="isHovered || props.selected">
      <a-tooltip title="Execute">
        <button class="toolbar-btn" @click.stop="$emit('execute')">
          <PlayCircleOutlined />
        </button>
      </a-tooltip>
      <a-tooltip title="Duplicate">
        <button class="toolbar-btn" @click.stop="$emit('duplicate')">
          <CopyOutlined />
        </button>
      </a-tooltip>
      <a-tooltip title="Disable">
        <button class="toolbar-btn" @click.stop="$emit('disable')">
          <StopOutlined />
        </button>
      </a-tooltip>
      <a-tooltip title="Delete">
        <button class="toolbar-btn delete" @click.stop="$emit('delete')">
          <DeleteOutlined />
        </button>
      </a-tooltip>
    </div>

    <!-- Node Content -->
    <div class="node-content" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
      <!-- Top row -->
      <div class="node-top">
        <div class="node-icon" :style="{ backgroundColor: nodeColor + '20', color: nodeColor }">
          <component :is="iconComponent" />
        </div>
        <div class="node-status" v-if="status">
          <CheckCircleFilled v-if="status === 'success'" class="status-success" />
          <ExclamationCircleFilled v-else-if="status === 'error'" class="status-error" />
          <ClockCircleFilled v-else-if="status === 'running'" class="status-running" />
        </div>
      </div>

      <!-- Main text -->
      <div class="node-info">
        <div class="node-title">{{ props.data.name }}</div>
        <div class="node-caption">{{ nodeCaption }}</div>
      </div>

      <!-- Footer -->
      <div class="node-footer">
        <span class="node-type-label">{{ nodeTypeLabel }}</span>
      </div>
    </div>

    <!-- Input Handle -->
    <Handle
      v-if="nodeType && nodeType.inputs > 0"
      type="target"
      :position="Position.Left"
      id="input-0"
      class="handle"
    />

    <!-- Output Handles -->
    <Handle
      v-for="i in (nodeType?.outputs || 1)"
      :key="`output-${i - 1}`"
      type="source"
      :position="Position.Right"
      :id="`output-${i - 1}`"
      class="handle"
      :style="getOutputHandleStyle(i - 1, nodeType?.outputs || 1)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import {
  PlayCircleOutlined,
  CopyOutlined,
  StopOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  ClockCircleFilled,
  ClockCircleOutlined,
  DatabaseOutlined,
  SearchOutlined,
  SwapOutlined,
  BranchesOutlined,
  ApartmentOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue';
import { NODE_TYPES, type INode } from '@/types/workflow';

const props = defineProps<{
  data: INode;
  selected?: boolean;
}>();

defineEmits<{
  execute: [];
  duplicate: [];
  disable: [];
  delete: [];
}>();

const isHovered = ref(false);
const status = ref<'success' | 'error' | 'running' | null>(null);

const nodeType = computed(() => NODE_TYPES[props.data.type]);
const nodeColor = computed(() => nodeType.value?.color || '#6B7280');

const iconMap: Record<string, unknown> = {
  ClockCircleOutlined,
  DatabaseOutlined,
  SearchOutlined,
  SwapOutlined,
  BranchesOutlined,
  ApartmentOutlined,
  ReloadOutlined,
};

const iconComponent = computed(() => {
  const iconName = nodeType.value?.icon || 'DatabaseOutlined';
  return iconMap[iconName] || DatabaseOutlined;
});

const nodeCaption = computed(() => {
  const type = props.data.type;
  const params = props.data.parameters;

  if (type === 'postgres') {
    return `${params.operation || 'Query'} · ${params.table || 'table'}`;
  }
  if (type === 'elasticsearch') {
    return `${params.operation || 'Search'} · ${params.index || 'index'}`;
  }
  if (type === 'scheduleTrigger') {
    return params.cron || 'Every hour';
  }
  return nodeType.value?.description || '';
});

const nodeTypeLabel = computed(() => {
  if (props.data.type.includes('Trigger')) {
    return 'Trigger';
  }
  return 'Action';
});

function getOutputHandleStyle(index: number, total: number) {
  if (total === 1) return { top: '50%' };
  const spacing = 100 / (total + 1);
  return { top: `${spacing * (index + 1)}%` };
}
</script>

<style lang="scss" scoped>
.workflow-node {
  position: relative;
  min-width: 180px;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  cursor: pointer;
  overflow: visible;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &.selected {
    border-color: #FF8A3D;
    box-shadow: 0 0 0 2px rgba(255, 138, 61, 0.2);
  }

  &.disabled {
    opacity: 0.5;
  }

  // Node type color accents
  &.node-scheduleTrigger { border-left: 4px solid #13c2c2; }
  &.node-postgres { border-left: 4px solid #336791; }
  &.node-elasticsearch { border-left: 4px solid #00bfb3; }
  &.node-transform { border-left: 4px solid #FF8A3D; }
  &.node-if { border-left: 4px solid #9254de; }
  &.node-switch { border-left: 4px solid #722ed1; }
  &.node-loop { border-left: 4px solid #eb6f00; }
}

.node-toolbar {
  position: absolute;
  top: -44px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  padding: 6px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  pointer-events: auto;
}

.toolbar-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #F3F4F6;
    color: #111827;
  }

  &.delete:hover {
    background: #FEE2E2;
    color: #E54848;
  }
}

.node-content {
  padding: 12px;
}

.node-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.node-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.node-status {
  font-size: 14px;
}

.status-success { color: #2EAD5F; }
.status-error { color: #E54848; }
.status-running { color: #FF8A3D; animation: spin 1s linear infinite; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.node-info {
  margin-bottom: 8px;
}

.node-title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-caption {
  font-size: 12px;
  color: #6B7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-footer {
  padding-top: 8px;
  border-top: 1px solid #F3F4F6;
}

.node-type-label {
  font-size: 11px;
  font-weight: 500;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.handle {
  width: 12px;
  height: 12px;
  background: #fff;
  border: 2px solid #E5E7EB;
  border-radius: 50%;
  transition: all 0.15s;

  &:hover {
    border-color: #FF8A3D;
    background: rgba(255, 138, 61, 0.1);
    transform: scale(1.2);
  }
}
</style>
