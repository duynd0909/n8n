<template>
  <div class="schema-tree-view">
    <div v-if="!treeData || treeData.length === 0" class="empty-state">
      <p>No data available</p>
    </div>
    
    <div v-else class="tree-container">
      <div class="item-count">{{ itemCount }}</div>
      
      <SchemaTreeNode
        v-for="node in treeData"
        :key="node.key"
        :node="node"
        :node-id="nodeId"
        :draggable="draggable"
        @field-drag="emit('field-drag', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreeNode, DragData, DataType } from './types'
import SchemaTreeNode from './SchemaTreeNode.vue'

interface Props {
  data: Record<string, any> | null
  nodeId: string
  draggable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  draggable: true
})
const emit = defineEmits<{
  'field-drag': [data: DragData]
}>()

const treeData = computed<TreeNode[]>(() => {
  if (!props.data) return []
  return buildTreeNodes(props.data, '')
})

const itemCount = computed(() => {
  if (!props.data) return '0 items'
  const count = Object.keys(props.data).length
  return count === 1 ? '1 item' : `${count} items`
})

function buildTreeNodes(
  obj: any,
  parentPath: string = ''
): TreeNode[] {
  if (!obj || typeof obj !== 'object') return []
  
  const nodes: TreeNode[] = []
  
  for (const [key, value] of Object.entries(obj)) {
    const path = parentPath ? `${parentPath}.${key}` : key
    const type = getDataType(value)
    
    const node: TreeNode = {
      key: path,
      name: key,
      value,
      type,
      path,
      expanded: type === 'object' || type === 'array'
    }
    
    if (type === 'object' && value !== null) {
      node.children = buildTreeNodes(value, path)
    } else if (type === 'array' && Array.isArray(value)) {
      node.children = value.map((item, index) => ({
        key: `${path}[${index}]`,
        name: `[${index}]`,
        value: item,
        type: getDataType(item),
        path: `${path}[${index}]`,
        expanded: getDataType(item) === 'object' || getDataType(item) === 'array',
        children: getDataType(item) === 'object' ? buildTreeNodes(item, `${path}[${index}]`) : undefined
      }))
    }
    
    nodes.push(node)
  }
  
  return nodes
}

function getDataType(value: any): DataType {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (Array.isArray(value)) return 'array'
  return typeof value as DataType
}
</script>

<style scoped lang="scss">
.schema-tree-view {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  
  p {
    margin: 0;
    font-size: 14px;
  }
}

.tree-container {
  padding: 12px 0;
}

.item-count {
  padding: 8px 12px;
  font-size: 12px;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin: 0 12px 12px;
  font-weight: 500;
}
</style>
