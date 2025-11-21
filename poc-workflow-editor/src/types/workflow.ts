export interface INode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  disabled?: boolean;
  parameters: Record<string, unknown>;
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
  nodes: INode[];
  connections: IConnections;
  active: boolean;
}

export interface INodeTypeDescription {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  group: string[];
  inputs: number;
  outputs: number;
  outputNames?: string[];
}

export const NODE_TYPES: Record<string, INodeTypeDescription> = {
  scheduleTrigger: {
    name: 'scheduleTrigger',
    displayName: 'Schedule Trigger',
    description: 'Trigger workflow on schedule',
    icon: 'ClockCircleOutlined',
    color: '#13c2c2',
    group: ['trigger'],
    inputs: 0,
    outputs: 1,
  },
  postgres: {
    name: 'postgres',
    displayName: 'PostgreSQL',
    description: 'Execute PostgreSQL queries',
    icon: 'DatabaseOutlined',
    color: '#336791',
    group: ['database'],
    inputs: 1,
    outputs: 1,
  },
  elasticsearch: {
    name: 'elasticsearch',
    displayName: 'Elasticsearch',
    description: 'Query Elasticsearch',
    icon: 'SearchOutlined',
    color: '#00bfb3',
    group: ['database'],
    inputs: 1,
    outputs: 1,
  },
  transform: {
    name: 'transform',
    displayName: 'Transform',
    description: 'Transform data fields',
    icon: 'SwapOutlined',
    color: '#ff5b00',
    group: ['transform'],
    inputs: 1,
    outputs: 1,
  },
  if: {
    name: 'if',
    displayName: 'If',
    description: 'Conditional routing',
    icon: 'BranchesOutlined',
    color: '#9254de',
    group: ['flow'],
    inputs: 1,
    outputs: 2,
    outputNames: ['true', 'false'],
  },
  switch: {
    name: 'switch',
    displayName: 'Switch',
    description: 'Multi-way routing',
    icon: 'ApartmentOutlined',
    color: '#722ed1',
    group: ['flow'],
    inputs: 1,
    outputs: 3,
    outputNames: ['Case 1', 'Case 2', 'Default'],
  },
};
