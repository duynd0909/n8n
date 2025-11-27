import type { Edge } from '@vue-flow/core';
import type { INode, IConnection } from '@/types/workflow';
import type { INodeTypeMetadata, INodeOutputConfig } from '@/types/nodeTypeRegistry';

// Base Strategy Interface
export interface IEdgeCreationStrategy {
	createEdges(
		node: INode,
		connections: Array<IConnection[] | null>,
		nodeTypeMetadata: INodeTypeMetadata,
		findNode: (name: string) => INode | undefined
	): Edge[];

	createPlaceholderEdges(
		node: INode,
		connections: Array<IConnection[] | null>,
		nodeTypeMetadata: INodeTypeMetadata
	): Edge[];
}

// Standard Edge Strategy (single output, standard nodes)
export class StandardEdgeStrategy implements IEdgeCreationStrategy {
	createEdges(
		node: INode,
		connections: Array<IConnection[] | null>,
		metadata: INodeTypeMetadata,
		findNode: (name: string) => INode | undefined
	): Edge[] {
		const edges: Edge[] = [];
		const outputConnections = connections[0] || [];

		outputConnections.forEach((conn, index) => {
			const targetNode = findNode(conn.node);
			if (!targetNode) return;

			edges.push({
				id: `${node.id}-0-${targetNode.id}-${index}`,
				source: node.id,
				target: targetNode.id,
				sourceHandle: undefined,
				targetHandle: undefined,
				type: 'custom',
				animated: true,
				markerEnd: 'arrowclosed',
				style: { stroke: metadata.color, strokeWidth: 2 },
			});
		});

		return edges;
	}

	createPlaceholderEdges(
		node: INode,
		connections: Array<IConnection[] | null>,
		_metadata: INodeTypeMetadata
	): Edge[] {
		// Check if node has any connections
		const hasConnections = connections.some((conns) => conns && conns.length > 0);

		if (hasConnections) {
			return [];
		}

		return [
			{
				id: `${node.id}-placeholder`,
				source: node.id,
				target: `placeholder-${node.id}`,
				type: 'default',
				animated: false,
				markerEnd: 'arrowclosed',
				style: {
					stroke: '#ddd',
					strokeWidth: 2,
					strokeDasharray: '5,5',
				},
			},
		];
	}
}

// Loop Edge Strategy (self-loop + done output)
export class LoopEdgeStrategy implements IEdgeCreationStrategy {
	createEdges(
		node: INode,
		connections: Array<IConnection[] | null>,
		metadata: INodeTypeMetadata,
		findNode: (name: string) => INode | undefined
	): Edge[] {
		const edges: Edge[] = [];

		// Create edges for each output
		metadata.outputs.forEach((output, outputIndex) => {
			const outputConnections = connections[outputIndex] || [];

			outputConnections.forEach((conn, connIndex) => {
				const targetNode = findNode(conn.node);
				if (!targetNode) return;

				edges.push({
					id: `${node.id}-${outputIndex}-${targetNode.id}-${connIndex}`,
					source: node.id,
					target: targetNode.id,
					sourceHandle: output.id,
					targetHandle: undefined,
					type: 'custom',
					animated: true,
					label: output.displayName,
					markerEnd: 'arrowclosed',
					style: { stroke: output.color, strokeWidth: 2 },
				});
			});
		});

		return edges;
	}

	createPlaceholderEdges(
		node: INode,
		connections: Array<IConnection[] | null>,
		metadata: INodeTypeMetadata
	): Edge[] {
		const edges: Edge[] = [];
		const doneOutput = metadata.outputs[0];
		const loopOutput = metadata.outputs[1];

		// Placeholder for "done" output if no connections
		const hasDoneConnection = connections[0] && connections[0].length > 0;
		if (!hasDoneConnection) {
			edges.push({
				id: `${node.id}-placeholder-done`,
				source: node.id,
				sourceHandle: doneOutput.id,
				target: `placeholder-done-${node.id}`,
				type: 'default',
				animated: false,
				label: doneOutput.displayName,
				markerEnd: 'arrowclosed',
				style: {
					stroke: doneOutput.color,
					strokeWidth: 2,
					strokeDasharray: '5,5',
				},
			});
		}

		// Self-loop edge for "loop" output if not already looping to self
		const isLoopingToSelf = connections[1]?.some((conn) => conn.node === node.name);

		if (!isLoopingToSelf) {
			edges.push({
				id: `${node.id}-self-loop`,
				source: node.id,
				sourceHandle: loopOutput.id,
				target: node.id,
				targetHandle: undefined,
				type: 'loop',
				animated: true,
				label: loopOutput.displayName,
				markerEnd: 'arrowclosed',
				style: {
					stroke: loopOutput.color,
					strokeWidth: 2,
				},
			});
		}

		return edges;
	}
}

// If Edge Strategy (similar to loop but no self-loop, just dual outputs)
export class IfEdgeStrategy implements IEdgeCreationStrategy {
	createEdges(
		node: INode,
		connections: Array<IConnection[] | null>,
		metadata: INodeTypeMetadata,
		findNode: (name: string) => INode | undefined
	): Edge[] {
		const edges: Edge[] = [];

		// Create edges for each output (true/false)
		metadata.outputs.forEach((output, outputIndex) => {
			const outputConnections = connections[outputIndex] || [];

			outputConnections.forEach((conn, connIndex) => {
				const targetNode = findNode(conn.node);
				if (!targetNode) return;

				edges.push({
					id: `${node.id}-${outputIndex}-${targetNode.id}-${connIndex}`,
					source: node.id,
					target: targetNode.id,
					sourceHandle: output.id,
					targetHandle: undefined,
					type: 'custom',
					animated: true,
					label: output.displayName,
					markerEnd: 'arrowclosed',
					style: { stroke: output.color, strokeWidth: 2 },
				});
			});
		});

		return edges;
	}

	createPlaceholderEdges(
		node: INode,
		connections: Array<IConnection[] | null>,
		_metadata: INodeTypeMetadata
	): Edge[] {
		// For If nodes, only create placeholder if NO connections at all
		const hasAnyConnection = connections.some((conns) => conns && conns.length > 0);

		if (hasAnyConnection) {
			return [];
		}

		// Single placeholder for if nodes (not separate per output)
		return [
			{
				id: `${node.id}-placeholder`,
				source: node.id,
				target: `placeholder-${node.id}`,
				type: 'default',
				animated: false,
				markerEnd: 'arrowclosed',
				style: {
					stroke: '#ddd',
					strokeWidth: 2,
					strokeDasharray: '5,5',
				},
			},
		];
	}
}

// Strategy Factory
export class EdgeStrategyFactory {
	private strategies: Map<string, IEdgeCreationStrategy> = new Map([
		['standard', new StandardEdgeStrategy()],
		['loop', new LoopEdgeStrategy()],
		['if', new IfEdgeStrategy()],
	]);

	getStrategy(strategyName: string): IEdgeCreationStrategy {
		return this.strategies.get(strategyName) || this.strategies.get('standard')!;
	}

	registerStrategy(name: string, strategy: IEdgeCreationStrategy): void {
		this.strategies.set(name, strategy);
	}
}

// Global Factory Instance
export const edgeStrategyFactory = new EdgeStrategyFactory();
