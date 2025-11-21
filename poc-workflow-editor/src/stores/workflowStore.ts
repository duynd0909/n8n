import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IWorkflow, INode } from '@/types/workflow';

export const useWorkflowStore = defineStore('workflow', () => {
  const currentWorkflow = ref<IWorkflow>({
    id: 'new-workflow',
    name: 'My Workflow',
    nodes: [],
    connections: {},
    active: false,
  });

  const selectedNodeId = ref<string | null>(null);
  const isDirty = ref(false);

  const nodes = computed(() => currentWorkflow.value.nodes);
  const connections = computed(() => currentWorkflow.value.connections);
  const selectedNode = computed(() =>
    nodes.value.find((n) => n.id === selectedNodeId.value) || null
  );

  function selectNode(nodeId: string | null) {
    selectedNodeId.value = nodeId;
  }

  function addNode(node: INode) {
    currentWorkflow.value.nodes.push(node);
    isDirty.value = true;
  }

  function updateNode(nodeId: string, updates: Partial<INode>) {
    const node = currentWorkflow.value.nodes.find((n) => n.id === nodeId);
    if (node) {
      Object.assign(node, updates);
      isDirty.value = true;
    }
  }

  function updateNodePosition(nodeId: string, position: [number, number]) {
    const node = currentWorkflow.value.nodes.find((n) => n.id === nodeId);
    if (node) {
      node.position = position;
    }
  }

  function removeNode(nodeId: string) {
    const node = currentWorkflow.value.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    currentWorkflow.value.nodes = currentWorkflow.value.nodes.filter(
      (n) => n.id !== nodeId
    );
    delete currentWorkflow.value.connections[node.name];

    for (const conns of Object.values(currentWorkflow.value.connections)) {
      for (const outputs of Object.values(conns)) {
        for (let i = 0; i < outputs.length; i++) {
          if (outputs[i]) {
            outputs[i] = outputs[i]!.filter((c) => c.node !== node.name);
          }
        }
      }
    }

    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null;
    }
    isDirty.value = true;
  }

  function addConnection(
    sourceNodeName: string,
    sourceOutputIndex: number,
    targetNodeName: string,
    targetInputIndex: number
  ) {
    if (!currentWorkflow.value.connections[sourceNodeName]) {
      currentWorkflow.value.connections[sourceNodeName] = { main: [] };
    }

    const outputs = currentWorkflow.value.connections[sourceNodeName].main;
    while (outputs.length <= sourceOutputIndex) {
      outputs.push(null);
    }

    if (!outputs[sourceOutputIndex]) {
      outputs[sourceOutputIndex] = [];
    }

    outputs[sourceOutputIndex]!.push({
      node: targetNodeName,
      type: 'main',
      index: targetInputIndex,
    });

    isDirty.value = true;
  }

  function removeConnection(edgeId: string) {
    const [sourceId, , targetId] = edgeId.split('-');
    const sourceNode = currentWorkflow.value.nodes.find((n) => n.id === sourceId);
    const targetNode = currentWorkflow.value.nodes.find((n) => n.id === targetId);

    if (!sourceNode || !targetNode) return;

    const conns = currentWorkflow.value.connections[sourceNode.name]?.main;
    if (conns) {
      for (const outputConns of conns) {
        if (outputConns) {
          const idx = outputConns.findIndex((c) => c.node === targetNode.name);
          if (idx !== -1) {
            outputConns.splice(idx, 1);
            isDirty.value = true;
            return;
          }
        }
      }
    }
  }

  return {
    currentWorkflow,
    selectedNodeId,
    selectedNode,
    isDirty,
    nodes,
    connections,
    selectNode,
    addNode,
    updateNode,
    updateNodePosition,
    removeNode,
    addConnection,
    removeConnection,
  };
});
