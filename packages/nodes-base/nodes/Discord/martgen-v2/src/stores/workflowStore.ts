import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IWorkflow, INode, IConnections, IConnection } from '@/types/workflow';

// New interfaces for execution and mock data
export interface NodeExecutionData {
	nodeId: string;
	nodeName: string;
	executionTime: string;
	status: 'success' | 'error' | 'running';
	data: any[];
	error?: string;
}

export const useWorkflowStore = defineStore('workflow', () => {
	// State
	const currentWorkflow = ref<IWorkflow | null>(null);
	const selectedNodeId = ref<string | null>(null);
	const isExecuting = ref(false);
	const isDirty = ref(false);

	// NEW: Execution results storage
	const executionResults = ref<Map<string, NodeExecutionData>>(new Map());

	// Getters
	const nodes = computed(() => currentWorkflow.value?.nodes ?? []);
	const connections = computed(() => currentWorkflow.value?.connections ?? {});
	const selectedNode = computed(
		() => nodes.value.find((n) => n.id === selectedNodeId.value) || null,
	);

	// NEW: Getters for execution data
	const getNodeExecutionData = computed(() => (nodeId: string) => {
		return executionResults.value.get(nodeId);
	});

	// Actions
	function initializeWorkflow() {
		currentWorkflow.value = {
			id: 'new-workflow',
			name: 'My Workflow',
			active: false,
			nodes: [],
			connections: {},
			settings: {
				executionOrder: 'v1',
				timezone: 'UTC',
			},
		};
	}

	function addNode(node: INode) {
		if (!currentWorkflow.value) return;
		currentWorkflow.value.nodes.push(node);
		isDirty.value = true;
	}

	function updateNode(nodeId: string, updates: Partial<INode>) {
		if (!currentWorkflow.value) return;
		const node = currentWorkflow.value.nodes.find((n) => n.id === nodeId);
		if (node) {
			Object.assign(node, updates);
			isDirty.value = true;
		}
	}

	function removeNode(nodeId: string) {
		if (!currentWorkflow.value) return;
		const node = currentWorkflow.value.nodes.find((n) => n.id === nodeId);
		if (!node) return;

		// Remove node
		currentWorkflow.value.nodes = currentWorkflow.value.nodes.filter((n) => n.id !== nodeId);

		// Remove connections from this node
		delete currentWorkflow.value.connections[node.name];

		// Remove connections to this node
		for (const [sourceName, nodeConns] of Object.entries(currentWorkflow.value.connections)) {
			for (const [connType, outputs] of Object.entries(nodeConns)) {
				for (let i = 0; i < outputs.length; i++) {
					if (outputs[i]) {
						outputs[i] = outputs[i]!.filter((c: IConnection) => c.node !== node.name);
					}
				}
			}
		}

		// Remove execution results
		executionResults.value.delete(nodeId);

		isDirty.value = true;
	}

	function addConnection(
		sourceNodeName: string,
		sourceOutputIndex: number,
		targetNodeName: string,
		targetInputIndex: number,
	) {
		if (!currentWorkflow.value) return;

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

	function removeConnection(
		sourceNodeName: string,
		sourceOutputIndex: number,
		targetNodeName: string,
		targetInputIndex: number,
	) {
		if (!currentWorkflow.value) return;

		const connections = currentWorkflow.value.connections[sourceNodeName];
		if (!connections || !connections.main) return;

		const outputs = connections.main[sourceOutputIndex];
		if (!outputs) return;

		connections.main[sourceOutputIndex] = outputs.filter(
			(c: IConnection) => !(c.node === targetNodeName && c.index === targetInputIndex),
		);

		isDirty.value = true;
	}

	function setSelectedNode(nodeId: string | null) {
		selectedNodeId.value = nodeId;
	}

	function setExecuting(executing: boolean) {
		isExecuting.value = executing;
	}

	// NEW: Actions for execution results
	function setExecutionResult(nodeId: string, data: NodeExecutionData) {
		executionResults.value.set(nodeId, data);
	}

	function clearExecutionResult(nodeId: string) {
		executionResults.value.delete(nodeId);
	}

	// Node Context Management
	function getNodeContext(nodeId: string): Record<string, unknown> | undefined {
		const node = nodes.value.find((n) => n.id === nodeId);
		return node?.context;
	}

	function setNodeContext(nodeId: string, context: Record<string, unknown>) {
		if (!currentWorkflow.value) return;
		const node = currentWorkflow.value.nodes.find((n) => n.id === nodeId);
		if (node) {
			node.context = context;
			isDirty.value = true;
		}
	}

	function clearNodeContext(nodeId: string) {
		if (!currentWorkflow.value) return;
		const node = currentWorkflow.value.nodes.find((n) => n.id === nodeId);
		if (node) {
			delete node.context;
			isDirty.value = true;
		}
	}

	return {
		// State
		currentWorkflow,
		selectedNodeId,
		isExecuting,
		isDirty,

		// Getters
		nodes,
		connections,
		selectedNode,

		// NEW: Execution & Mock Data
		executionResults,

		// Actions
		initializeWorkflow,
		addNode,
		updateNode,
		removeNode,
		addConnection,
		removeConnection,
		setSelectedNode,
		setExecuting,
		getNodeExecutionData,

		// NEW: Execution & Mock Data Actions
		setExecutionResult,
		clearExecutionResult,

		// Node Context Management
		getNodeContext,
		setNodeContext,
		clearNodeContext,
	};
});
