import type { Component } from 'vue';
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

// Node Type Metadata Interfaces

export interface INodeOutputConfig {
	index: number;
	id: string; // 'output-0', 'output-1'
	displayName: string; // 'done', 'loop', 'true', 'false'
	color: string; // '#52c41a', '#fa8c16'
	handleOffset: number; // Vertical offset from center (%)
}

export interface INodeTypeMetadata {
	type: string;
	displayName: string;
	icon: Component;
	color: string;
	group: 'trigger' | 'action' | 'flow' | 'data';

	// Input/Output Configuration
	inputs: {
		count: number;
		allowsConnections: boolean;
	};
	outputs: INodeOutputConfig[];

	// Behavior Configuration
	configComponent?: Component;
	edgeStrategy?: 'standard' | 'loop' | 'if';
	placeholderStrategy?: 'standard' | 'multi-output' | 'none';
}

// Node Type Registry Class

export class NodeTypeRegistry {
	private types: Map<string, INodeTypeMetadata> = new Map();

	register(metadata: INodeTypeMetadata): void {
		this.types.set(metadata.type, metadata);
	}

	get(type: string): INodeTypeMetadata | undefined {
		return this.types.get(type);
	}

	getOutputConfig(type: string, outputIndex: number): INodeOutputConfig | undefined {
		return this.types.get(type)?.outputs[outputIndex];
	}

	hasMultipleOutputs(type: string): boolean {
		return (this.types.get(type)?.outputs.length ?? 1) > 1;
	}

	isTriggerNode(type: string): boolean {
		return this.types.get(type)?.group === 'trigger';
	}

	getAllTypes(): INodeTypeMetadata[] {
		return Array.from(this.types.values());
	}

	getOutputCount(type: string): number {
		return this.types.get(type)?.outputs.length ?? 1;
	}
}

// Global Registry Instance
export const nodeTypeRegistry = new NodeTypeRegistry();

// Node Type Registrations
// Import config components dynamically to avoid circular dependencies
// These will be lazy-loaded when needed

// Loop Node
nodeTypeRegistry.register({
	type: 'loop',
	displayName: 'Loop Over Items',
	icon: SyncOutlined,
	color: '#eb6f00',
	group: 'flow',
	inputs: { count: 1, allowsConnections: true },
	outputs: [
		{
			index: 0,
			id: 'output-0',
			displayName: 'done',
			color: '#52c41a',
			handleOffset: -25,
		},
		{
			index: 1,
			id: 'output-1',
			displayName: 'loop',
			color: '#fa8c16',
			handleOffset: 25,
		},
	],
	edgeStrategy: 'loop',
	placeholderStrategy: 'multi-output',
});

// If Node
nodeTypeRegistry.register({
	type: 'if',
	displayName: 'If',
	icon: BranchesOutlined,
	color: '#9254de',
	group: 'flow',
	inputs: { count: 1, allowsConnections: true },
	outputs: [
		{
			index: 0,
			id: 'output-0',
			displayName: 'true',
			color: '#52c41a',
			handleOffset: -25,
		},
		{
			index: 1,
			id: 'output-1',
			displayName: 'false',
			color: '#ff4d4f',
			handleOffset: 25,
		},
	],
	edgeStrategy: 'if',
	placeholderStrategy: 'standard',
});

// PostgreSQL Node
nodeTypeRegistry.register({
	type: 'postgres',
	displayName: 'PostgreSQL',
	icon: DatabaseOutlined,
	color: '#336791',
	group: 'data',
	inputs: { count: 1, allowsConnections: true },
	outputs: [
		{
			index: 0,
			id: 'output-0',
			displayName: '',
			color: '#ff5b00',
			handleOffset: 0,
		},
	],
	edgeStrategy: 'standard',
	placeholderStrategy: 'standard',
});

// Elasticsearch Node
nodeTypeRegistry.register({
	type: 'elasticsearch',
	displayName: 'Elasticsearch',
	icon: SearchOutlined,
	color: '#00bfb3',
	group: 'data',
	inputs: { count: 1, allowsConnections: true },
	outputs: [
		{
			index: 0,
			id: 'output-0',
			displayName: '',
			color: '#ff5b00',
			handleOffset: 0,
		},
	],
	edgeStrategy: 'standard',
	placeholderStrategy: 'standard',
});

// Transform Node
nodeTypeRegistry.register({
	type: 'transform',
	displayName: 'Transform',
	icon: SwapOutlined,
	color: '#ff5b00',
	group: 'action',
	inputs: { count: 1, allowsConnections: true },
	outputs: [
		{
			index: 0,
			id: 'output-0',
			displayName: '',
			color: '#ff5b00',
			handleOffset: 0,
		},
	],
	edgeStrategy: 'standard',
	placeholderStrategy: 'standard',
});

// Switch Node
nodeTypeRegistry.register({
	type: 'switch',
	displayName: 'Switch',
	icon: SplitCellsOutlined,
	color: '#722ed1',
	group: 'flow',
	inputs: { count: 1, allowsConnections: true },
	outputs: [
		{
			index: 0,
			id: 'output-0',
			displayName: '',
			color: '#ff5b00',
			handleOffset: 0,
		},
	],
	edgeStrategy: 'standard',
	placeholderStrategy: 'standard',
});

// Schedule Node (Trigger)
nodeTypeRegistry.register({
	type: 'schedule',
	displayName: 'Schedule',
	icon: ClockCircleOutlined,
	color: '#13c2c2',
	group: 'trigger',
	inputs: { count: 0, allowsConnections: false },
	outputs: [
		{
			index: 0,
			id: 'output-0',
			displayName: '',
			color: '#ff5b00',
			handleOffset: 0,
		},
	],
	edgeStrategy: 'standard',
	placeholderStrategy: 'standard',
});

// Manual Trigger Node
nodeTypeRegistry.register({
	type: 'manual',
	displayName: 'Manual Trigger',
	icon: ClockCircleOutlined,
	color: '#13c2c2',
	group: 'trigger',
	inputs: { count: 0, allowsConnections: false },
	outputs: [
		{
			index: 0,
			id: 'output-0',
			displayName: '',
			color: '#ff5b00',
			handleOffset: 0,
		},
	],
	edgeStrategy: 'standard',
	placeholderStrategy: 'standard',
});

// Code Node
nodeTypeRegistry.register({
	type: 'code',
	displayName: 'Code',
	icon: CodeOutlined,
	color: '#ff6600',
	group: 'action',
	inputs: { count: 1, allowsConnections: true },
	outputs: [
		{
			index: 0,
			id: 'output-0',
			displayName: '',
			color: '#ff5b00',
			handleOffset: 0,
		},
	],
	edgeStrategy: 'standard',
	placeholderStrategy: 'standard',
});
