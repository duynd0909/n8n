// Workflow types based on WORKFLOW_DEVELOPMENT_PLAN.md

export interface INode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  disabled?: boolean;
  parameters: Record<string, unknown>;
  credentials?: Record<string, string>;
  context?: Record<string, unknown>; // Node-specific state (e.g., loop iteration state)
}

export interface IConnection {
  node: string;
  type: string;
  index: number;
}

export interface IConnections {
  [sourceNodeName: string]: {
    [connectionType: string]: Array<IConnection[] | null>;
  };
}

export interface IWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: INode[];
  connections: IConnections;
  settings?: IWorkflowSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface IWorkflowSettings {
  executionOrder?: 'v0' | 'v1';
  timezone?: string;
  saveExecutionProgress?: boolean;
  saveManualExecutions?: boolean;
}

export interface INodeTypeDescription {
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  color?: string;
  group: string[];
  version: number;
  inputs: INodeIOConfiguration[];
  outputs: INodeIOConfiguration[];
  outputNames?: string[]; // Labels for output ports (e.g., ['done', 'loop'])
  properties: INodeProperty[];
  credentials?: ICredentialDescription[];
}

export interface INodeIOConfiguration {
  type: string;
  displayName?: string; // Custom label for the port
}

export interface INodeProperty {
  name: string;
  displayName: string;
  type: string;
  default?: unknown;
  required?: boolean;
  options?: IPropertyOption[];
  placeholder?: string;
  description?: string;
}

export interface IPropertyOption {
  name: string;
  value: string | number;
}

export interface ICredentialDescription {
  name: string;
  displayName: string;
  required: boolean;
}

export interface IExecutionResult {
  id: string;
  status: 'success' | 'error' | 'running' | 'canceled';
  runData: Record<string, ITaskData>;
  startedAt: string;
  finishedAt?: string;
}

export interface ITaskData {
  startTime: number;
  executionTime: number;
  executionStatus: string;
  data?: Record<string, INodeExecutionData[][]>;
  error?: IExecutionError;
}

export interface INodeExecutionData {
  json: Record<string, unknown>;
  binary?: Record<string, unknown>;
}

export interface IExecutionError {
  message: string;
  stack?: string;
}

// Node categories for palette
export type NodeCategory = 'trigger' | 'database' | 'transform' | 'flow' | 'core';

export interface INodeTypeCategory {
  name: string;
  displayName: string;
  icon: string;
  nodeTypes: INodeTypeDescription[];
}

// Loop Node Context
export interface ILoopNodeContext {
  currentRunIndex: number;       // Current iteration (0-based)
  maxRunIndex: number;           // Total iterations needed
  items: INodeExecutionData[];   // Remaining unprocessed items
  processedItems: INodeExecutionData[]; // All processed items accumulated
  sourceData: unknown;           // Original input source data
  noItemsLeft: boolean;          // True when items array is empty
  done: boolean;                 // True when loop completes
}
