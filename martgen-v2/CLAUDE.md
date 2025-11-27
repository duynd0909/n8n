# CLAUDE.md - Martgen v2 Workflow Editor

## Project Overview

This is a **standalone proof-of-concept (PoC)** workflow editor built with Vue 3, TypeScript, and Vue Flow. It demonstrates the core concepts of n8n's workflow editor without being part of the main n8n codebase.

**Important:** This project exists **outside** the main n8n repository at `d:\Projects\n8n`. It references n8n's architecture and patterns for learning purposes but is a separate implementation.

## Purpose

This PoC serves as:
- A learning implementation of n8n's workflow editor concepts
- A testing ground for workflow UI/UX patterns
- Reference implementation for understanding n8n's node-based architecture
- Standalone demo that doesn't require the full n8n stack

## Technology Stack

- **Vue 3** with Composition API and `<script setup>`
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Vue Flow** (@vue-flow/core) for canvas-based workflow visualization
- **Ant Design Vue** for UI components
- **Pinia** for state management
- **SCSS** for styling with custom design tokens

## Project Structure

```
martgen-v2/
├── src/
│   ├── components/
│   │   ├── layout/           # Layout components (TopBar, Sidebar, etc.)
│   │   └── workflow/         # Workflow-specific components
│   │       ├── nodes/        # Node type configurations (Loop, Code, etc.)
│   │       ├── schema/       # Data schema visualization
│   │       ├── WorkflowCanvas.vue    # Main canvas with Vue Flow
│   │       ├── WorkflowNode.vue      # Node rendering component
│   │       ├── CustomEdge.vue        # Edge rendering with add button
│   │       └── PlaceholderNode.vue   # Placeholder for adding nodes
│   ├── stores/
│   │   ├── workflowStore.ts  # Workflow state management
│   │   └── executionStore.ts # Execution state management
│   ├── types/
│   │   └── workflow.ts       # TypeScript interfaces matching n8n patterns
│   ├── theme/
│   │   └── config.ts         # Design tokens and theming
│   └── main.ts
├── index.html
├── vite.config.ts
├── package.json
└── CLAUDE.md (this file)
```

## Key Concepts from n8n

### Node Types

The PoC implements several node types based on n8n patterns:

1. **Trigger Nodes** (schedule, manual) - No input handle, only output
2. **Action Nodes** (postgres, elasticsearch, code) - Standard input/output
3. **Flow Control Nodes** (if, switch, loop) - Multiple outputs
4. **Loop Node** (Split In Batches) - Special dual-output node

### Loop Node Implementation

The **Loop Over Items** node is based on n8n's **Split In Batches** node (`n8n-nodes-base.splitInBatches`):

#### Key Features:
- **Three handles total:**
  - 1 target handle on the left (input)
  - 2 source handles on the right (outputs)
    - Top handle: "done" output (green) - emits when loop completes
    - Bottom handle: "loop" output (orange) - emits current batch during iteration

#### Expected Behavior:
- Automatically creates a placeholder node connected to "done" output
- Creates a self-loop edge from "loop" output back to the node's input
- Maintains stateful execution through node context
- Displays edge labels near handles ("done" and "loop")

#### Parameters:
- **Batch Size**: Number of items per iteration (default: 1)
- **Reset**: Whether to restart from beginning on new input (default: false)

### Workflow Data Structure

The workflow data follows n8n's structure:

```typescript
interface IWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: INode[];              // Array of nodes
  connections: IConnections;   // Connection mapping
}

interface IConnections {
  [sourceNodeName: string]: {
    main: Array<IConnection[] | null>;  // Indexed by output port
  };
}
```

**Important:** Connections use node **names** (not IDs) as keys, matching n8n's architecture.

## Development Guidelines

### Adding New Node Types

1. Create config component in `src/components/workflow/nodes/[NodeType]Config.vue`
2. Add node type to `nodeTypes` in `WorkflowNode.vue`
3. Define icon and color in `nodeIconMap` and `nodeColorMap`
4. For multi-output nodes, update `nodeOutputNames` and handle logic

### Working with Vue Flow

- Nodes must have unique IDs
- Handles use `Position.Left` and `Position.Right` enums
- Multi-output nodes need custom handle IDs: `output-0`, `output-1`, etc.
- Edge connections reference handle IDs for multi-output scenarios

### State Management

- **workflowStore**: Manages workflow structure (nodes, connections)
- **executionStore**: Manages execution state and results
- Node context stored directly in `INode.context` field

### Styling

- Use SCSS variables defined in theme files
- Follow spacing and color conventions from `src/theme/config.ts`
- Maintain consistent handle sizes (8px × 16px)
- Use semantic colors for node types (green=success/done, orange=loop/warning)

## Differences from Main n8n

This PoC differs from the full n8n implementation:

1. **No backend integration** - Workflows don't execute real nodes
2. **Simplified execution** - Mock execution for demonstration
3. **Limited node types** - Only essential nodes implemented
4. **No credentials** - Authentication/credentials not implemented
5. **No data persistence** - Workflows exist only in memory
6. **Standalone** - Doesn't depend on n8n packages

## Reference Documentation

For understanding n8n's actual implementation:
- See `docs/loop_node_specification.md` (in main n8n repo) for loop node details
- Main n8n CLAUDE.md at `d:\Projects\n8n\CLAUDE.md`
- n8n source: `packages/editor-ui/` and `packages/nodes-base/`

## Known Issues / TODOs

- [ ] Loop node self-loop edge not automatically created
- [ ] Edge labels for multi-output nodes need refinement
- [ ] Placeholder node for "done" output not auto-generated
- [ ] Node context visualization not implemented
- [ ] Execution flow for stateful nodes needs work

## Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Notes for Claude Code

- This is a **reference implementation** - look at main n8n code for production patterns
- When asked about n8n features, distinguish between this PoC and actual n8n
- File paths here are relative to `martgen-v2/`, not the main n8n repo
- Vue Flow documentation: https://vueflow.dev/
- This project uses Vue 3 Composition API exclusively
