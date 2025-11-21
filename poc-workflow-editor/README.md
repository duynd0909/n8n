# Workflow Editor POC

A proof-of-concept workflow editor built with Vue 3, Ant Design Vue, and Vue Flow.

## Features

- Visual workflow canvas with drag-and-drop nodes
- Pre-built demo workflow (PostgreSQL -> Transform -> If -> Elasticsearch)
- Node types:
  - **Schedule Trigger** - Cron-based workflow triggering
  - **PostgreSQL** - Database operations (SELECT, INSERT, UPDATE, DELETE)
  - **Elasticsearch** - Search and indexing operations
  - **Transform** - Data transformation and mapping
  - **If** - Conditional routing (true/false branches)
  - **Switch** - Multi-way routing
- Node configuration panel
- Connection management
- Mini-map and canvas controls

## Tech Stack

- **Vue 3** - Composition API with `<script setup>`
- **TypeScript** - Full type safety
- **Pinia** - State management
- **Vue Flow** - Node-based graph editor
- **Ant Design Vue 4** - UI components
- **Vite** - Build tool

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Project Structure

```
src/
├── components/
│   ├── TopBar.vue           # Header with workflow controls
│   ├── NodePalette.vue      # Draggable node list
│   ├── WorkflowCanvas.vue   # Vue Flow canvas
│   ├── WorkflowNode.vue     # Custom node component
│   └── NodeConfigPanel.vue  # Node configuration drawer
├── stores/
│   └── workflowStore.ts     # Pinia store for workflow state
├── types/
│   └── workflow.ts          # TypeScript interfaces
├── theme/
│   └── config.ts            # Ant Design theme configuration
├── styles/
│   └── main.css             # Global styles and CSS variables
├── App.vue                  # Root component
└── main.ts                  # Application entry
```

## Usage

1. **Add Nodes**: Drag nodes from the left palette onto the canvas
2. **Connect Nodes**: Click and drag from output handle to input handle
3. **Configure Nodes**: Click a node to open the configuration panel
4. **Remove Connections**: Click on an edge to remove it
5. **Move Nodes**: Drag nodes to reposition them
6. **Save/Execute**: Use the top bar buttons

## Design System

- **Primary Color**: `#ff5b00` (Orange)
- **Node Colors**:
  - PostgreSQL: `#336791`
  - Elasticsearch: `#00bfb3`
  - Transform: `#ff5b00`
  - If: `#9254de`
  - Switch: `#722ed1`
  - Schedule: `#13c2c2`

## Demo Workflow

The POC comes with a pre-configured demo workflow:

```
Schedule Trigger -> PostgreSQL -> Transform -> If Condition
                                                  ├── (true) -> Elasticsearch (active_users)
                                                  └── (false) -> Elasticsearch (archived_users)
```

This demonstrates:
- Trigger-based workflow execution
- Database querying
- Data transformation
- Conditional routing with multiple outputs
- Multiple destination nodes
