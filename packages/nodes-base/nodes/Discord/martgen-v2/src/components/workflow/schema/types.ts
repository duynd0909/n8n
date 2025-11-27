// Schema component types and interfaces

export type ViewMode = 'schema' | 'table' | 'json';
export type ExecutionStatus = 'success' | 'error' | 'running' | 'idle';
export type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'undefined';

export interface SchemaViewerProps {
	title: 'INPUT' | 'OUTPUT';
	nodeId: string;
	data: Record<string, any> | null;
	status?: ExecutionStatus;
	defaultView?: ViewMode;
	searchable?: boolean;
	editable?: boolean;
}

export interface DragData {
	fieldPath: string; // e.g., "data.user.email"
	fieldName: string; // e.g., "email"
	fieldValue: any; // The actual value
	valueType: DataType; // Type of the value
	expression: string; // e.g., "{{$input.data.user.email}}"
	sourceNodeId: string; // ID of the source node
}

export interface TreeNode {
	key: string;
	name: string;
	value: any;
	type: DataType;
	path: string;
	children?: TreeNode[];
	expanded?: boolean;
}

export interface MockDataEditorProps {
	nodeId: string;
	currentMockData?: Record<string, any>;
}
