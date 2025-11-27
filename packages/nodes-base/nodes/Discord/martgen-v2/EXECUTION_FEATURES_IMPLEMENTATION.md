# Workflow Execution Features Implementation

This document describes the implementation of the three main execution features for the workflow system.

## Overview

Three major features have been implemented:

1. **Execute Workflow Button** - Floating button to run workflows
2. **Executions Tab** - View execution history with read-only canvas
3. **Execution Log Panel** - Bottom panel showing live execution logs

## Architecture

### New Files Created

1. **`src/stores/executionStore.ts`**
   - Manages workflow execution state
   - Tracks execution history per workflow
   - Stores node statuses and logs
   - Provides mock execution logic (to be replaced with actual execution engine)

2. **`src/components/workflow/WorkflowEditor.vue`**
   - Wrapper component with tab switcher
   - Tabs: Editor | Executions
   - Manages active tab state
   - Conditionally renders ExecutionLog panel

3. **`src/components/workflow/ExecutionsView.vue`**
   - Left panel: List of execution runs
   - Right panel: Read-only canvas with execution status
   - Node detail drawer with Input/Output/Logs tabs
   - Execution-specific node border colors (green=success, red=error)

4. **`src/components/workflow/ExecutionLog.vue`**
   - Collapsible bottom panel (40px collapsed, 35vh expanded)
   - Three tabs: Summary, Node Logs, Raw
   - Monospace font with grid-style background
   - Color-coded log levels (info, warn, error)

### Modified Files

1. **`src/components/workflow/WorkflowCanvas.vue`**
   - Added floating Execute Workflow button
   - Integrated execution store
   - Button appears at bottom-center with elevation effects

2. **`src/components/workflow/WorkflowNode.vue`**
   - Connected to execution store for status visualization
   - Shows status icons (success/error/running)
   - Supports execution border styling for read-only view

3. **`src/App.vue`**
   - Updated to use WorkflowEditor instead of WorkflowCanvas directly

## Feature Details

### 1. Execute Workflow Button

**Location:** Fixed at bottom-center of canvas

**Appearance:**
- Large primary orange pill button
- Icon: Play circle (▶)
- Label: "Execute Workflow"

**Behavior:**
- Only visible when workflow has nodes
- Shows loading state during execution
- Hover effect: Slight lift with enhanced shadow
- Active effect: Press down

**Implementation:**
```vue
<div class="execute-button-container">
  <a-button
    type="primary"
    size="large"
    :loading="isExecuting"
    @click="handleExecuteWorkflow"
  >
    Execute Workflow
  </a-button>
</div>
```

### 2. Executions Tab

**Tab Switcher:**
- Tabs: Editor | Executions
- Active tab: Orange underline + orange text
- Located in TopBar (center of the top navigation)
- Managed via Ant Design's `a-segmented` component

**Executions View Layout:**

```
+---------------------------+------------------------------+
| Runs (left list)          | Canvas (read-only)           |
+---------------------------+------------------------------+
```

**Run List (Left Panel - 320px):**
- Shows executions for current workflow only
- Each item displays:
  - Status icon (success ✓, error ✗, running ⟳)
  - Execution ID
  - Timestamp (e.g., "2 min ago")
- Selected run highlighted with orange background

**Read-Only Canvas (Right Panel):**
- Same workflow nodes, not draggable
- Node borders reflect execution status:
  - Green (2px) → Success
  - Red (2px) → Error
  - Gray (1px) → Not executed
- Click node → Opens detail drawer

**Node Detail Drawer:**
- Width: 400px
- Position: Right side
- Tabs: Input | Output | Logs
- Shows execution data and logs for selected node

### 3. Execution Log Panel

**Location:** Bottom of Workflow Editor

**Collapsed State (40px height):**
- Shows: "Logs" title
- Status summary: "Last run: Success · 200ms"
- Click to expand/collapse

**Expanded State (35% screen height):**
- Three tabs: Summary | Node Logs | Raw

**Summary Tab:**
- Execution status badge
- Start time
- Duration
- Nodes executed count

**Node Logs Tab:**
- Left panel: List of nodes with status indicators
- Right panel: Logs for selected node
- Monospace font on dark background (#1e1e1e)
- Color-coded entries:
  - Info: Cyan (#4ec9b0)
  - Warn: Yellow (#dcdcaa)
  - Error: Red (#f48771)

**Raw Logs Tab:**
- All logs in chronological order
- Format: `[timestamp] [nodeName] LEVEL message`
- Monospace font on dark background
- Supports JSON formatting, stack traces

## Execution Store API

### State
- `executions`: Map of workflowId → execution results
- `currentExecutionId`: Active execution ID
- `executionLogs`: Array of log entries
- `nodeStatuses`: Map of nodeId → status

### Actions
- `executeWorkflow(workflowId, nodes, connections)`: Execute workflow
- `startExecution(workflowId, executionId)`: Initialize execution
- `updateNodeStatus(nodeId, status)`: Update node status
- `addLog(log)`: Add log entry
- `finishExecution(executionId, status)`: Complete execution
- `setCurrentExecution(executionId)`: View specific execution
- `clearCurrentExecution()`: Clear logs

### Getters
- `currentExecution`: Current execution object
- `getExecutionsForWorkflow(workflowId)`: Get execution history
- `getNodeStatus(nodeId)`: Get node status
- `getNodeLogs(nodeId)`: Get logs for specific node

## Node Status Visualization

Nodes display execution status in real-time:

1. **Status Icons** (top-right corner):
   - ✓ Success (green)
   - ✗ Error (red)
   - ⟳ Running (blue, spinning)

2. **Border Colors** (read-only execution view):
   - Green 2px border: Success
   - Red 2px border: Error
   - Gray 1px border: Not executed

## Mock Execution Logic

The current implementation includes a mock execution engine that:
- Executes nodes sequentially
- Simulates 1-2 second delays per node
- Has 80% success rate (20% random failures)
- Generates sample output data
- Logs all operations

**To replace with real execution:**
1. Implement actual node execution logic in `executeWorkflow()`
2. Connect to workflow execution engine
3. Update node data with real inputs/outputs
4. Stream logs in real-time

## Styling

### Colors
- Primary: `#ff5b00` (Orange)
- Success: `#52c41a` (Green)
- Error: `#ff4d4f` (Red)
- Info: `#1890ff` (Blue)

### Fonts
- UI: Inter
- Code/Logs: JetBrains Mono

### Shadows
- Button: `0 16px 48px rgba(0, 0, 0, 0.16)`
- Hover: `0 20px 56px rgba(0, 0, 0, 0.2)`

## Future Enhancements

1. **Re-run from Node** - Button in execution view to restart from specific node
2. **Execution Filtering** - Filter by status, date range
3. **Export Logs** - Download logs as JSON/TXT
4. **Execution Metrics** - Charts showing success rates, durations
5. **Live Updates** - WebSocket streaming for real-time logs
6. **Partial Execution** - Execute only selected nodes
7. **Debugging** - Breakpoints and step-through execution
8. **Execution Queue** - Manage multiple concurrent executions

## Testing Checklist

- [ ] Execute button appears when workflow has nodes
- [ ] Execute button triggers workflow execution
- [ ] Tab switcher shows Editor and Executions tabs
- [ ] Executions view shows run history
- [ ] Clicking execution shows read-only canvas
- [ ] Node borders reflect execution status
- [ ] Clicking node opens detail drawer
- [ ] Drawer shows input/output/logs
- [ ] Execution log panel is collapsible
- [ ] Summary tab shows execution metadata
- [ ] Node logs tab shows per-node logs
- [ ] Raw logs tab shows all logs
- [ ] Node status icons appear during execution
- [ ] Logs clear when starting new execution

## Dependencies

- **Vue 3**: Framework
- **Pinia**: State management
- **@vue-flow/core**: Canvas visualization
- **Ant Design Vue**: UI components
