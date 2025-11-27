

# Part 1: Loop Node Implementation

## Key Finding: Loop Node = "Split In Batches" Node
The "Loop Over Items" node in n8n is actually implemented as the **Split In Batches** node (`n8n-nodes-base.splitInBatches`). The node has "Loop" as one of its aliases.

---

## How the Loop Node Works

### Core Concept
The Loop node enables iteration over a collection of items by:
1. Splitting input items into batches of a specified size
2. Processing each batch through a workflow loop
3. Maintaining state across iterations using node context
4. Returning all processed items when the loop completes

### Implementation Details

**Main File:** [SplitInBatchesV3.node.ts](packages/nodes-base/nodes/SplitInBatches/v3/SplitInBatchesV3.node.ts)

#### Node Configuration
- **Display Name:** "Loop Over Items (Split in Batches)"
- **Node Type:** `n8n-nodes-base.splitInBatches`
- **Icon:** Sync icon (fa:sync) in dark green
- **Version:** 3 (current), with v1 and v2 for backward compatibility

#### Parameters
1. **Batch Size** (required)
   - Type: number
   - Default: 1
   - Min: 1
   - Description: Number of items to return with each loop iteration

2. **Options**
   - **Reset** (boolean, default: false)
     - When true: Restarts from the beginning instead of continuing
     - When false: Continues processing remaining items

#### Outputs (V3)
The node has **two output ports**:
1. **Output 0 - "done"**: Emits processed items when loop completes
2. **Output 1 - "loop"**: Emits current batch during each iteration

> **Note:** V2 had reversed output order: "loop" first, then "done"

---

## Execution Flow

### State Machine Approach
The node uses a **context-based state machine** to maintain loop state:

#### First Execution (`nodeContext.items === undefined`)
```typescript
1. Get input items and batch size
2. Calculate maxRunIndex = Math.ceil(items.length / batchSize)
3. Initialize context:
   - currentRunIndex = 0
   - items = remaining items after first batch
   - sourceData = input source data (for pairing)
   - processedItems = []
4. Return first batch on "loop" output (output 1)
5. Return empty array on "done" output (output 0)
```

#### Subsequent Executions
```typescript
1. Increment currentRunIndex
2. Extract next batch from nodeContext.items
3. Update pairedItem metadata to maintain data lineage
4. Add newly processed items to processedItems array
5. Check if nodeContext.items.length === 0
   - If yes: set noItemsLeft = true
   - If no: continue looping
6. Return current batch on "loop" output OR
   all processedItems on "done" output if complete
```

#### Completion Detection
```typescript
if (returnItems.length === 0) {
  nodeContext.done = true;
  return [nodeContext.processedItems, []];  // done output, empty loop output
}

nodeContext.done = false;
return [[], returnItems];  // empty done output, current batch on loop
```

---

## Node Context Structure

The node stores persistent state in `nodeContext`:

```typescript
{
  currentRunIndex: number,    // Current iteration (0-based)
  maxRunIndex: number,        // Total iterations needed
  items: INodeExecutionData[], // Remaining unprocessed items
  processedItems: INodeExecutionData[], // All processed items
  sourceData: any,            // Original input source data
  noItemsLeft: boolean,       // True when items array is empty
  done: boolean               // True when loop completes
}
```

This context is accessible in workflows via expressions:
- `$node["Loop Over Items"].context["currentRunIndex"]`
- `$node["Loop Over Items"].context["maxRunIndex"]`
- `$node["Loop Over Items"].context["noItemsLeft"]`

---

## Paired Item Tracking

The node maintains **data lineage** through pairedItem metadata:

### Purpose
- Track which output items came from which input items
- Enable n8n to show data flow in the UI
- Support debugging and data inspection

### Implementation
On subsequent iterations, the node:
1. Adds `sourceOverwrite` to each item's pairedItem
2. Maps processed items back to original input indices
3. Preserves pairing information through the loop

---

## Workflow Pattern

### Automatic Helper Node
When you add "Loop Over Items" to a workflow, n8n automatically:
1. Creates a **NoOp (Replace Me)** node as a placeholder
2. Connects: `Loop Over Items` → `NoOp` → back to `Loop Over Items`
3. This creates the loop-back connection structure

**Implementation:** [useActions.ts:344-361](packages/frontend/editor-ui/src/features/shared/nodeCreator/composables/useActions.ts#L344-L361)

### Example Workflow Structure
```
Manual Trigger → Process Data → Loop Over Items ←→ Process Batch
                                       ↓
                                    (done)
                                       ↓
                                  Final Output
```

### Test Workflow Example
From [SplitInBatches.workflow_v2.json](packages/nodes-base/nodes/SplitInBatches/test/SplitInBatches.workflow_v2.json):

```
Manual Trigger → Set → Item Lists → Split In Batches → IF
                                           ↑              ↓ (false/loop)
                                           └──────────────┘
                                                          ↓ (true/done)
                                                        Output
```

The IF node checks `$node["Split In Batches"].context["noItemsLeft"]`:
- **false**: Loop back to Split In Batches for next iteration
- **true**: Exit loop and output results

---

## Key Architectural Features

### 1. Stateful Execution
Unlike most n8n nodes that are stateless, the Loop node:
- Persists state across multiple executions
- Uses `getContext('node')` to store/retrieve state
- Maintains iteration counters and remaining items

### 2. Dual Output Pattern
- Enables conditional routing based on loop status
- "loop" output: active during iteration
- "done" output: active only when complete

### 3. Data Lineage Preservation
- Tracks original source data through iterations
- Maintains pairedItem relationships
- Enables accurate data flow visualization

### 4. Reset Functionality
- `reset: true` option allows restarting from scratch
- Useful when receiving new input data mid-execution
- Clears previous context and reinitializes

### 5. Versioning Support
- V1: Single output port
- V2: Dual outputs ("loop", "done")
- V3: Dual outputs ("done", "loop") + improved pairing
- Maintains backward compatibility with older workflows

---

## Special Considerations

### Pin Data Restrictions
The Loop node is listed in `PIN_DATA_NODE_TYPES_DENYLIST` - you cannot pin data to this node in the UI.

**Reason:** Pinning data would conflict with the stateful iteration logic.

### Important Notice
The node displays a warning:
> "You may not need this node — n8n nodes automatically run once for each input item."

This reminds users that n8n has built-in implicit looping - most operations don't need explicit loops.

---

## Files Reference

### Core Implementation
- [SplitInBatchesV3.node.ts](packages/nodes-base/nodes/SplitInBatches/v3/SplitInBatchesV3.node.ts) - Current implementation
- [SplitInBatchesV2.node.ts](packages/nodes-base/nodes/SplitInBatches/v2/SplitInBatchesV2.node.ts) - Previous version
- [SplitInBatchesV1.node.ts](packages/nodes-base/nodes/SplitInBatches/v1/SplitInBatchesV1.node.ts) - Original version
- [SplitInBatches.node.ts](packages/nodes-base/nodes/SplitInBatches/SplitInBatches.node.ts) - Version wrapper

### Metadata & Tests
- [SplitInBatches.node.json](packages/nodes-base/nodes/SplitInBatches/SplitInBatches.node.json) - Node metadata
- [SplitInBatches.node.test.ts](packages/nodes-base/nodes/SplitInBatches/test/SplitInBatches.node.test.ts) - Unit tests
- [SplitInBatches.workflow_v2.json](packages/nodes-base/nodes/SplitInBatches/test/SplitInBatches.workflow_v2.json) - Integration test

### Frontend Integration
- [useActions.ts:344-361](packages/frontend/editor-ui/src/features/shared/nodeCreator/composables/useActions.ts#L344-L361) - Auto-adds helper node
- [nodeTypes.ts:58](packages/frontend/editor-ui/src/app/constants/nodeTypes.ts#L58) - Node type constant
