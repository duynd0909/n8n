<template>
  <div class="schema-tree-node">
    <div v-if="isExpandable" class="node-container">
      <div class="node-header" @click="toggleExpanded">
        <span class="expand-icon" :class="{ expanded: isExpanded }">▶</span>
        <SchemaFieldItem
          :field-name="node.name"
          :field-value="node.value"
          :field-path="node.path"
          :node-id="nodeId"
          :draggable="draggable"
          @drag-start="emit('field-drag', $event)"
        />
      </div>

      <div v-if="isExpanded" class="node-children">
        <SchemaTreeNode
          v-for="child in node.children"
          :key="child.key"
          :node="child"
          :node-id="nodeId"
          :level="level + 1"
          :draggable="draggable"
          @field-drag="emit('field-drag', $event)"
        />
      </div>
    </div>

    <div v-else class="node-leaf">
      <!-- Spacer to align with expand icon -->
      <span class="expand-spacer"/>
      <SchemaFieldItem
        :field-name="node.name"
        :field-value="node.value"
        :field-path="node.path"
        :node-id="nodeId"
        :draggable="draggable"
        @drag-start="emit('field-drag', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TreeNode, DragData } from './types';
import SchemaFieldItem from './SchemaFieldItem.vue';

interface Props {
  node: TreeNode;
  nodeId: string;
  level?: number;
  draggable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  draggable: true,
});

const emit = defineEmits<{
  'field-drag': [data: DragData];
}>();

const isExpanded = ref(props.node.expanded ?? true);

const isExpandable = computed(() => {
  return props.node.type === 'object' || props.node.type === 'array';
});

function toggleExpanded() {
  if (isExpandable.value) {
    isExpanded.value = !isExpanded.value;
  }
}
</script>

<style scoped lang="scss">
.schema-tree-node {
  width: 100%;
}

.node-container {
  width: 100%;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding-left: 4px;

  &:hover {
    background-color: #fafafa;
  }
}

.node-leaf {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-left: 4px;
}

.expand-icon,
.expand-spacer {
  font-size: 10px;
  color: #999;
  transition: transform 0.2s;
  user-select: none;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-icon {
  &.expanded {
    transform: rotate(90deg);
  }
}

.node-children {
  padding-left: 20px;
  /* Removed border-left to match minimal design */
  /* border-left: 1px solid #e0e0e0; */
  /* margin-left: 8px; */
}
</style>
