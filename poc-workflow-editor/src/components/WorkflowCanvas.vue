<template>
  <div
    class="canvas-wrapper"
    @drop="onDrop"
    @dragover.prevent
    @dragenter.prevent
  >
    <VueFlow
      v-model:nodes="flowNodes"
      v-model:edges="flowEdges"
      :node-types="nodeTypes"
      :default-viewport="{ x: 100, y: 100, zoom: 1 }"
      :default-edge-options="defaultEdgeOptions"
      :min-zoom="0.25"
      :max-zoom="2"
      :snap-to-grid="true"
      :snap-grid="[20, 20]"
      :connection-line-style="connectionLineStyle"
      :connection-line-type="ConnectionLineType.SmoothStep"
      fit-view-on-init
      class="workflow-canvas"
      @node-click="onNodeClick"
      @node-double-click="onNodeDoubleClick"
      @nodes-change="onNodesChange"
      @connect="onConnect"
      @edge-click="onEdgeClick"
      @pane-click="onPaneClick"
    >
      <Background pattern-color="#E5E7EB" :gap="20" />
      <Controls position="bottom-left" class="canvas-controls" />
      <MiniMap position="bottom-right" class="canvas-minimap" />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue';
import { VueFlow, type Node, type Edge, type Connection, ConnectionLineType } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

import { useWorkflowStore } from '@/stores/workflowStore';
import type { INode, INodeTypeDescription } from '@/types/workflow';
import WorkflowNode from './WorkflowNode.vue';

const emit = defineEmits<{
  'open-config': [node: INode];
}>();

const workflowStore = useWorkflowStore();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: any = {
  custom: markRaw(WorkflowNode),
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { stroke: '#94A3B8', strokeWidth: 2 },
  animated: false,
};

const connectionLineStyle = { stroke: '#FF8A3D', strokeWidth: 2, strokeDasharray: '5 5' };

// Convert store nodes to Vue Flow nodes
const flowNodes = computed<Node[]>({
  get: () => {
    return workflowStore.nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      position: { x: node.position[0], y: node.position[1] },
      data: node,
      selected: workflowStore.selectedNodeId === node.id,
    }));
  },
  set: () => {
    // Handled by onNodesChange
  },
});

// Convert store connections to Vue Flow edges
const flowEdges = computed<Edge[]>({
  get: () => {
    const edges: Edge[] = [];

    for (const [sourceName, nodeConns] of Object.entries(workflowStore.connections)) {
      const sourceNode = workflowStore.nodes.find((n) => n.name === sourceName);
      if (!sourceNode) continue;

      const outputs = nodeConns.main || [];
      outputs.forEach((connections, outputIndex) => {
        if (!connections) return;

        connections.forEach((conn) => {
          const targetNode = workflowStore.nodes.find((n) => n.name === conn.node);
          if (!targetNode) return;

          edges.push({
            id: `${sourceNode.id}-${outputIndex}-${targetNode.id}-${conn.index}`,
            source: sourceNode.id,
            target: targetNode.id,
            sourceHandle: `output-${outputIndex}`,
            targetHandle: `input-${conn.index}`,
            type: 'smoothstep',
            style: { stroke: '#94A3B8', strokeWidth: 2 },
            animated: false,
          });
        });
      });
    }

    return edges;
  },
  set: () => {
    // Handled by connect/edge events
  },
});

function onNodeClick(event: { node: Node }) {
  workflowStore.selectNode(event.node.id);
}

function onNodeDoubleClick(event: { node: Node }) {
  const node = event.node;
  const selectedNode = workflowStore.nodes.find(n => n.id === node.id);
  if (selectedNode) {
    emit('open-config', selectedNode);
  } else if (node.data) {
    emit('open-config', node.data as INode);
  }
}

function onPaneClick() {
  workflowStore.selectNode(null);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onNodesChange(changes: any[]) {
  changes.forEach((change) => {
    if (change.type === 'position' && change.position) {
      workflowStore.updateNodePosition(change.id, [change.position.x, change.position.y]);
    }
  });
}

function onConnect(params: Connection) {
  const sourceNode = workflowStore.nodes.find((n) => n.id === params.source);
  const targetNode = workflowStore.nodes.find((n) => n.id === params.target);

  if (sourceNode && targetNode) {
    const sourceIndex = parseInt(params.sourceHandle?.replace('output-', '') || '0');
    const targetIndex = parseInt(params.targetHandle?.replace('input-', '') || '0');

    workflowStore.addConnection(sourceNode.name, sourceIndex, targetNode.name, targetIndex);
  }
}

function onEdgeClick(event: { edge: Edge }) {
  workflowStore.removeConnection(event.edge.id);
}

function onDrop(event: DragEvent) {
  const data = event.dataTransfer?.getData('application/nodeType');
  if (!data) return;

  const nodeType: INodeTypeDescription = JSON.parse(data);
  const canvasRect = (event.target as HTMLElement).getBoundingClientRect();

  const position: [number, number] = [
    event.clientX - canvasRect.left - 90,
    event.clientY - canvasRect.top - 40,
  ];

  const existingCount = workflowStore.nodes.filter((n) => n.type === nodeType.name).length;
  const newNode: INode = {
    id: `node-${Date.now()}`,
    name: `${nodeType.displayName}${existingCount > 0 ? ` ${existingCount + 1}` : ''}`,
    type: nodeType.name,
    typeVersion: 1,
    position,
    parameters: {},
  };

  workflowStore.addNode(newNode);
}
</script>

<style lang="scss" scoped>
.canvas-wrapper {
  flex: 1;
  height: 100%;
  position: relative;
}

.workflow-canvas {
  width: 100%;
  height: 100%;
  background-color: #F3F4F6;
  background-image: radial-gradient(circle, #E5E7EB 1px, transparent 1px);
  background-size: 20px 20px;
}

// Edge styles
:deep(.vue-flow__edge-path) {
  stroke: #94A3B8;
  stroke-width: 2;
  transition: stroke 0.2s, stroke-width 0.2s;
}

:deep(.vue-flow__edge:hover .vue-flow__edge-path) {
  stroke: #FF8A3D;
  stroke-width: 3;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: #FF8A3D;
  stroke-width: 3;
}

// Connection line while dragging
:deep(.vue-flow__connection-line) {
  stroke: #FF8A3D;
  stroke-width: 2;
  stroke-dasharray: 5 5;
}

// Handle styles
:deep(.vue-flow__handle) {
  width: 14px;
  height: 14px;
  background: #fff;
  border: 2px solid #94A3B8;
  transition: all 0.15s;

  &:hover {
    border-color: #FF8A3D;
    background: #FFF7ED;
    transform: scale(1.3);
  }

  &.connecting {
    border-color: #FF8A3D;
  }
}

:deep(.vue-flow__handle-valid) {
  background: #D1FAE5;
  border-color: #10B981;
}

:deep(.vue-flow__handle-invalid) {
  background: #FEE2E2;
  border-color: #EF4444;
}

// Controls
.canvas-controls {
  :deep(.vue-flow__controls) {
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  :deep(.vue-flow__controls-button) {
    background: #fff;
    border-bottom: 1px solid #F3F4F6;
    color: #6B7280;
    width: 32px;
    height: 32px;

    &:hover {
      background: #F9FAFB;
      color: #FF8A3D;
    }

    &:last-child {
      border-bottom: none;
    }
  }
}

// Minimap
.canvas-minimap {
  :deep(.vue-flow__minimap) {
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

// Selection box
:deep(.vue-flow__selection) {
  background: rgba(255, 138, 61, 0.1);
  border: 1px dashed #FF8A3D;
}

// Allow node toolbar overflow
:deep(.vue-flow__node) {
  overflow: visible !important;
}
</style>
