# Workflow Execution - Component Structure

## Component Hierarchy

```
App.vue
├── TopBar.vue (with Tab Switcher: Editor | Executions)
├── LeftSidebar.vue
├── WorkflowEditor.vue ⭐ NEW
│   ├── [Editor Tab]
│   │   ├── WorkflowCanvas.vue
│   │   │   ├── VueFlow
│   │   │   ├── WorkflowNode.vue (with execution status)
│   │   │   ├── PlaceholderNode.vue
│   │   │   ├── CustomEdge.vue
│   │   │   └── Execute Button (floating) ⭐ NEW
│   │   └── ExecutionLog.vue ⭐ NEW (bottom panel)
│   │       └── Tabs: Summary | Node Logs | Raw
│   └── [Executions Tab]
│       └── ExecutionsView.vue ⭐ NEW
│           ├── Run List (left panel)
│           └── Read-Only Canvas (right panel)
│               └── Node Detail Drawer
└── RightPanel.vue
    └── NodePalette.vue
```

## Store Architecture

```
stores/
├── workflowStore.ts (existing)
│   ├── currentWorkflow
│   ├── nodes
│   ├── connections
│   └── selectedNode
└── executionStore.ts ⭐ NEW
    ├── executions (Map<workflowId, IExecutionResult[]>)
    ├── currentExecutionId
    ├── executionLogs (IExecutionLog[])
    ├── nodeStatuses (Map<nodeId, status>)
    └── executeWorkflow() - mock execution logic
```

## Data Flow

### Tab Switching Flow
```
User clicks "Executions" in TopBar
    ↓
TopBar emits 'tabChange' event with value 'Executions'
    ↓
App.vue handles @tab-change
    ↓
currentTab ref updated to 'Executions'
    ↓
WorkflowEditor receives :active-tab="currentTab" prop
    ↓
WorkflowEditor watches prop change and updates local activeTab
    ↓
ExecutionsView.vue rendered (v-show="activeTab === 'Executions'")
```

### Execution Flow
```
User clicks "Execute Workflow"
    ↓
WorkflowCanvas.handleExecuteWorkflow()
    ↓
executionStore.executeWorkflow(workflowId, nodes, connections)
    ↓
For each node:
    ├── updateNodeStatus(nodeId, 'running')
    ├── addLog({ nodeId, level, message })
    ├── [Execute node logic]
    ├── addNodeData(executionId, nodeName, taskData)
    └── updateNodeStatus(nodeId, 'success' | 'error')
    ↓
finishExecution(executionId, status)
```

### Node Status Updates
```
executionStore.updateNodeStatus(nodeId, status)
    ↓
nodeStatuses Map updated
    ↓
WorkflowNode.executionStatus computed property reacts
    ↓
Status icon displayed on node
```

### Execution History View
```
User clicks "Executions" tab
    ↓
ExecutionsView.vue rendered
    ↓
Fetch: executionStore.getExecutionsForWorkflow(workflowId)
    ↓
Display run list (left panel)
    ↓
User selects execution
    ↓
executionStore.setCurrentExecution(executionId)
    ↓
Read-only canvas rendered with execution data
    ├── Node border colors from execution status
    └── Click node → Show detail drawer
```

## Key Computed Properties

### WorkflowNode.vue
```typescript
// Execution status from store
executionStatus = computed(() => {
  const status = executionStore.getNodeStatus(nodeId)
  return status === 'pending' ? null : status
})

// Execution border style (for read-only view)
executionBorderStyle = computed(() => {
  if (data.executionBorderColor) {
    return { borderColor, borderWidth }
  }
})
```

### ExecutionsView.vue
```typescript
// Executions for current workflow
executions = computed(() =>
  executionStore.getExecutionsForWorkflow(workflowId)
)

// Selected execution
selectedExecution = computed(() =>
  executions.find(e => e.id === selectedExecutionId)
)

// Nodes with execution status styling
executionNodes = computed(() =>
  nodes.map(node => ({
    ...node,
    executionStatus: taskData?.executionStatus,
    executionBorderColor: success ? green : error ? red : gray
  }))
)
```

## Type Definitions

### IExecutionResult
```typescript
interface IExecutionResult {
  id: string
  status: 'success' | 'error' | 'running' | 'canceled'
  runData: Record<string, ITaskData>
  startedAt: string
  finishedAt?: string
}
```

### ITaskData
```typescript
interface ITaskData {
  startTime: number
  executionTime: number
  executionStatus: string
  data?: Record<string, INodeExecutionData[][]>
  error?: IExecutionError
}
```

### IExecutionLog
```typescript
interface IExecutionLog {
  nodeId: string
  nodeName: string
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
}
```

## Styling Constants

### Execute Button
- Position: `fixed, bottom: 48px, left: 50%`
- Transform: `translateX(-50%)`
- Height: `48px`
- Border-radius: `9999px` (pill shape)
- Box-shadow: `0 16px 48px rgba(0,0,0,0.16)`
- Hover: `translateY(-2px)` + enhanced shadow

### Execution Log Panel
- Collapsed: `height: 40px`
- Expanded: `height: 35vh`
- Background: Dark theme `#1e1e1e` for logs
- Font: `JetBrains Mono, Fira Code, Consolas`

### Executions View
- Run List: `width: 320px`
- Canvas: `flex: 1`
- Drawer: `width: 400px`

## Events & Emits

### WorkflowEditor
```typescript
emit('openNodePalette')
```

### WorkflowCanvas
```typescript
emit('openNodePalette')
```

### ExecutionsView
- No emits (self-contained)

### ExecutionLog
- No emits (self-contained)

## State Management Pattern

### Reactive State
All execution state is centralized in `executionStore`:
- Components are stateless
- Data flows one-way: Store → Components
- Actions update store, components react

### Execution Lifecycle
1. **Start**: `startExecution()` - Creates execution record
2. **Progress**: `updateNodeStatus()`, `addLog()`, `addNodeData()`
3. **End**: `finishExecution()` - Marks complete
4. **View**: `setCurrentExecution()` - Switch to execution view
5. **Clear**: `clearCurrentExecution()` - Reset state

## Performance Considerations

### Execution Storage
- Executions stored in Map for O(1) lookup
- Limited to current workflow (not all workflows)
- Can be extended with pagination for large histories

### Log Updates
- Logs append-only (array push)
- No reactivity overhead from object updates
- Can be optimized with virtual scrolling for 1000+ logs

### Node Status Updates
- Uses Map for O(1) status lookup
- Minimal re-renders (only affected nodes)
- Status computed on-demand, not stored redundantly

## Testing Strategy

### Unit Tests
- `executionStore.ts`: Test all actions and getters
- Computed properties in components
- Log formatting functions

### Integration Tests
- Execute workflow → Verify logs appear
- Switch to Executions tab → Verify history
- Click execution → Verify canvas updates
- Node status updates → Verify visual feedback

### E2E Tests
- Full execution flow from button click to completion
- Tab navigation
- Execution history persistence
- Node detail drawer interaction
