# Architecture Plan: Simplified Workflow Engine (Spring Boot + Vue 3)

This document outlines the technical design for a simplified workflow automation platform compatible with [n8n](https://n8n.io). The system uses **Spring Boot** for the backend execution engine and **Vue 3 + Vue Flow** for the frontend designer.

## 1. System Overview

The goal is to build a lightweight version of n8n that supports:
-   **Graph-based Workflow Design**: Visual editor to connect nodes.
-   **JSON Compatibility**: Strict adherence to n8n's JSON structure for potential portability.
-   **Data Processing**: Focus on Postgres and ElasticSearch/OpenSearch integrations.
-   **Control Flow**: Support for If, Switch, Loop, and custom logic.
-   **Scheduling**: Quartz-based Cron triggers.
-   **Execution**: A Java-based interpretation engine that executes the JSON graph.

---

## 2. Data Structures (n8n Compatibility)

To ensure compatibility, we will mirror n8n's core data structures in Java.

### 2.1. Core JSON Structure (Reference)

An n8n workflow JSON looks like this:

```json
{
  "nodes": [
    {
      "id": "uuid-1",
      "name": "Postgres",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [100, 200],
      "parameters": {
        "operation": "select",
        "schema": "public",
        "table": "users"
      }
    }
  ],
  "connections": {
    "Postgres": {
      "main": [
        [
          { "node": "NextNode", "type": "main", "index": 0 }
        ]
      ]
    }
  }
}
```

### 2.2. Java Domain Models

We will use `Jackson` for JSON serialization/deserialization.

**`Workflow.java`**
```java
public class Workflow {
    private String id;
    private String name;
    private boolean active;
    private List<Node> nodes;
    // Map<NodeName, Map<ConnectionType, List<List<Connection>>>>
    private Map<String, Map<String, List<List<Connection>>>> connections;
    private WorkflowSettings settings;
}
```

**`Node.java`**
```java
public class Node {
    private String id;
    private String name;
    private String type;
    private double typeVersion;
    private List<Double> position;
    private Map<String, Object> parameters;
    private Map<String, Object> credentials;
}
```

**`Connection.java`**
```java
public class Connection {
    private String node; // Destination node name
    private String type; // e.g., "main"
    private int index;   // Input index on destination
}
```

---

## 3. Backend Architecture (Spring Boot)

### 3.1. Service Layer

*   **`WorkflowService`**: CRUD operations for workflows.
*   **`ExecutionService`**: Manages the lifecycle of a workflow run (QUEUED -> RUNNING -> FINISHED/FAILED).
*   **`NodeRegistry`**: A service that discovers and registers available node implementations (Strategy Pattern).

### 3.2. The Execution Engine (`WorkflowEngine`)

The core logic mimics `WorkflowExecute.ts` from n8n.

**Key Components:**
1.  **`ExecutionStack`**: A queue of nodes waiting to be executed.
2.  **`ExecutionData`**: Stores the input/output data for every node run.
3.  **`NodeRunner`**: Responsible for executing a single node.

**Algorithm:**
1.  Identify **Start Nodes** (Trigger nodes or manual start).
2.  Initialize `nodeExecutionStack` with the Start Node(s).
3.  **Loop** while stack is not empty:
    *   Pop `currentNode`.
    *   Retrieve inputs for `currentNode` from `ExecutionData` (from previous nodes).
    *   **Execute**: Call `nodeImplementation.execute(inputs, params)`.
    *   Store results in `ExecutionData`.
    *   **Traverse**: Look up `connections` for `currentNode`.
    *   Push connected children to `nodeExecutionStack`.
4.  Handle **Wait/Merge**: If a node has multiple inputs (like Merge), wait until all inputs are available before executing.

### 3.3. Node Implementation Strategy

We will use a common interface for all nodes.

```java
public interface WorkflowNode {
    String getType(); // e.g., "n8n-nodes-base.postgres"

    /**
     * @param inputData List of data items from previous node.
     * @param parameters Configuration from JSON.
     * @param context Access to helpers (variables, secrets, database).
     */
    List<NodeExecutionData> execute(
        List<NodeExecutionData> inputData,
        Map<String, Object> parameters,
        ExecutionContext context
    ) throws Exception;
}
```

**Implementations:**
*   `PostgresNode`: Uses `JdbcTemplate` or `EntityManager`. Supports operations: Select, Insert, Update, Delete.
*   `ElasticSearchNode`: Uses `ElasticsearchClient`.
*   `IfNode`: Evaluates conditions (using SPEL or simple Java logic) and routes data to output index 0 (True) or 1 (False).
*   `SwitchNode`: Routes to different outputs based on rules.
*   `CronTriggerNode`: Registered with Quartz Scheduler.

### 3.4. Scheduling (Quartz)

*   Upon saving an active workflow with a `Cron` node:
    *   Parse the Cron expression.
    *   Schedule a Quartz Job (`WorkflowJob`) with the Workflow ID.
*   **`WorkflowJob`**:
    *   Instantiates the `WorkflowEngine`.
    *   Triggers execution starting from the Cron node.

---

## 4. Frontend Architecture (Vue 3)

### 4.1. Technology Stack
*   **Framework**: Vue 3 (Composition API).
*   **Graph Library**: Vue Flow (highly customizable, easy integration).
*   **State Management**: Pinia.
*   **UI Library**: Element Plus or Tailwind.

### 4.2. Graph Transformation

n8n uses an adjacency list for connections, while Vue Flow uses explicit Edge objects. We need transformers.

**n8n -> Vue Flow (Load):**
1.  Map `nodes` -> Vue Flow `nodes`.
2.  Iterate `connections`:
    *   For each `sourceNode` -> `outputs` -> `destNode`:
    *   Create Edge: `{ id: "e1", source: sourceNode, target: destNode, sourceHandle: "main-0", targetHandle: "main-0" }`.

**Vue Flow -> n8n (Save):**
1.  Map `nodes` -> n8n `nodes` (update position, params).
2.  Iterate Edges:
    *   Reconstruct the `connections` map `{ [SourceNode]: { main: [[ { node: TargetNode, ... } ]] } }`.

### 4.3. Node Editor Component
*   A sidebar or modal that opens when a node is clicked.
*   Dynamic form generation based on node type.
    *   **Postgres**: Dropdown for Operation (Select/Insert), Inputs for Query/Table.
    *   **Logic**: Condition builder for If/Switch.
*   "Test Node" button: Calls backend endpoint `/api/nodes/test` with current params and input data.

---

## 5. Implementation Roadmap

### Phase 1: Project Skeleton & Data Models
1.  Initialize Spring Boot project.
2.  Define Entities (`Workflow`, `Node`, `Connection`) and Repository.
3.  Initialize Vue 3 project with Vue Flow.

### Phase 2: The Engine Core
1.  Implement `WorkflowEngine` loop.
2.  Implement `CodeNode` (or simple PassThrough) to test flow.
3.  Implement connection traversal logic.

### Phase 3: Integration Nodes
1.  Implement `PostgresNode` (Select/Insert).
2.  Implement `ElasticSearchNode`.
3.  Build Frontend Node properties panel for these nodes.

### Phase 4: Logic & Scheduling
1.  Implement `IfNode` and `SwitchNode`.
2.  Integrate Quartz for `CronTrigger`.
3.  Frontend: Visualizing execution results (green/red borders, data preview).

---

## 6. Integration Details

### Postgres Node
*   **Inputs**: Credentials (saved separately or generic), Schema, Table, Operation, Columns.
*   **Logic**: Construct SQL dynamically or use JPA raw queries.
*   **Return**: List of Maps (JSON objects).

### ElasticSearch/OpenSearch Node
*   **Inputs**: Index, Body (JSON), Operation (Index, Search, Get).
*   **Logic**: Use Low-Level or Java Client.

### Scheduling
*   Use `spring-boot-starter-quartz`.
*   Store Job Keys as `workflowId_nodeId`.
