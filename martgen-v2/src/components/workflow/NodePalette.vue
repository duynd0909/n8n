<template>
  <div class="node-palette">
    <div class="palette-header">
      <h3>Add Node</h3>
      <a-input-search
        v-model:value="searchQuery"
        placeholder="Search nodes..."
        :allow-clear="true"
      />
    </div>

    <div class="palette-content">
      <div
        v-for="category in filteredCategories"
        :key="category.name"
        class="node-category"
      >
        <h4 class="category-title">{{ category.displayName }}</h4>

        <div class="node-list">
          <div
            v-for="node in category.nodes"
            :key="node.type"
            class="node-card"
            :style="{ borderLeftColor: node.color }"
            @click="selectNode(node)"
          >
            <div class="node-icon" :style="{ backgroundColor: node.color }">
              <component :is="node.icon" />
            </div>
            <div class="node-info">
              <div class="node-title">{{ node.displayName }}</div>
              <div class="node-description">{{ node.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import {
  DatabaseOutlined,
  SearchOutlined,
  SwapOutlined,
  BranchesOutlined,
  SplitCellsOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CodeOutlined,
} from '@ant-design/icons-vue';

const searchQuery = ref('');

// Emit events to parent
const emit = defineEmits<{
  (e: 'closePanel'): void;
  (e: 'nodeSelected', nodeTemplate: any): void;
}>();

const nodeCategories = [
  {
    name: 'trigger',
    displayName: 'Triggers',
    nodes: [
      {
        type: 'schedule',
        displayName: 'Schedule',
        description: 'Trigger workflow on a schedule',
        color: '#13c2c2',
        icon: h(ClockCircleOutlined),
      },
    ],
  },
  {
    name: 'database',
    displayName: 'Database',
    nodes: [
      {
        type: 'postgres',
        displayName: 'PostgreSQL',
        description: 'Execute queries on PostgreSQL database',
        color: '#336791',
        icon: h(DatabaseOutlined),
      },
      {
        type: 'elasticsearch',
        displayName: 'Elasticsearch',
        description: 'Query and manipulate Elasticsearch data',
        color: '#00bfb3',
        icon: h(SearchOutlined),
      },
    ],
  },
  {
    name: 'transform',
    displayName: 'Data Transformation',
    nodes: [
      {
        type: 'transform',
        displayName: 'Transform',
        description: 'Transform and map data fields',
        color: '#ff5b00',
        icon: h(SwapOutlined),
      },
      {
        type: 'code',
        displayName: 'Code',
        description: 'Execute custom JavaScript code',
        color: '#ff6600',
        icon: h(CodeOutlined),
      },
    ],
  },
  {
    name: 'flow',
    displayName: 'Flow Control',
    nodes: [
      {
        type: 'if',
        displayName: 'If',
        description: 'Route items based on conditions',
        color: '#9254de',
        icon: h(BranchesOutlined),
      },
      {
        type: 'switch',
        displayName: 'Switch',
        description: 'Route items to different outputs',
        color: '#722ed1',
        icon: h(SplitCellsOutlined),
      },
      {
        type: 'loop',
        displayName: 'Loop Over Items',
        description: 'Split items into batches and loop',
        color: '#eb6f00',
        icon: h(SyncOutlined),
      },
    ],
  },
];

const filteredCategories = computed(() => {
  if (!searchQuery.value) return nodeCategories;

  const query = searchQuery.value.toLowerCase();
  return nodeCategories
    .map((category) => ({
      ...category,
      nodes: category.nodes.filter(
        (node) =>
          node.displayName.toLowerCase().includes(query) ||
          node.description.toLowerCase().includes(query)
      ),
    }))
    .filter((category) => category.nodes.length > 0);
});

function selectNode(nodeTemplate: any) {
  // Emit node selection to parent and close panel
  emit('nodeSelected', nodeTemplate);
  emit('closePanel');
}
</script>

<style scoped lang="scss">
.node-palette {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.palette-header {
  padding: $spacing-md;
  border-bottom: 1px solid $color-border;

  h3 {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-sm;
    color: $color-text;
  }
}

.palette-content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md;
}

.node-category {
  margin-bottom: $spacing-lg;

  &:last-child {
    margin-bottom: 0;
  }
}

.category-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-text-secondary;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: $spacing-sm;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.node-card {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm;
  background: $color-bg;
  border: 1px solid $color-border-light;
  border-left: 3px solid;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-normal;

  &:hover {
    background: $color-bg-hover;
    border-color: $color-border;
    transform: translateX(4px);
    box-shadow: $shadow-sm;
  }
}

.node-icon {
  width: 32px;
  height: 32px;
  @include flex-center;
  border-radius: $radius-sm;
  color: white;
  font-size: $font-size-lg;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-title {
  font-size: $font-size-md;
  font-weight: $font-weight-medium;
  color: $color-text;
  margin-bottom: 2px;
}

.node-description {
  font-size: $font-size-xs;
  color: $color-text-secondary;
  @include text-clamp(2);
}
</style>
