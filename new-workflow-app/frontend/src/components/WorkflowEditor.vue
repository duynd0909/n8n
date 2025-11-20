<template>
  <div class="workflow-container">
    <div class="header">
      <a-button type="primary" @click="executeWorkflow" :loading="loading">Execute Workflow</a-button>
      <span style="margin-left: 10px;">Status: {{ executionStatus }}</span>
    </div>

    <div class="editor-area">
      <VueFlow
        v-model="elements"
        :fit-view-on-init="true"
        class="basicflow"
        :default-viewport="{ zoom: 1.5 }"
        :min-zoom="0.2"
        :max-zoom="4"
      >
        <Background />
        <Controls />
      </VueFlow>
    </div>

    <div class="logs-area" v-if="logs">
      <h3>Execution Logs</h3>
      <pre>{{ logs }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import axios from 'axios'

// Define some sample initial data (simulating an n8n JSON structure loaded and converted)
// For the PoC, we are initializing VueFlow elements directly, but we will keep the n8n JSON
// as the "source of truth" for the execution payload.

const n8nWorkflowData = {
  name: "My PoC Workflow",
  nodes: [
    {
      id: "node-1",
      name: "Start",
      type: "n8n-nodes-base.start",
      typeVersion: 1,
      position: [100, 100],
      parameters: {}
    },
    {
      id: "node-2",
      name: "Postgres",
      type: "n8n-nodes-base.postgres",
      typeVersion: 1,
      position: [400, 100],
      parameters: {
        operation: "select",
        table: "users"
      }
    },
     {
      id: "node-3",
      name: "ElasticSearch",
      type: "n8n-nodes-base.elasticsearch",
      typeVersion: 1,
      position: [700, 100],
      parameters: {
        operation: "index",
        index: "users_idx"
      }
    }
  ],
  connections: {
    "Start": {
      "main": [
        [
          { "node": "Postgres", "type": "main", "index": 0 }
        ]
      ]
    },
    "Postgres": {
      "main": [
        [
            { "node": "ElasticSearch", "type": "main", "index": 0 }
        ]
      ]
    }
  }
}

// Transform n8n JSON to Vue Flow elements
const initialElements = [
  { id: 'node-1', type: 'input', label: 'Start', position: { x: 100, y: 100 } },
  { id: 'node-2', label: 'Postgres', position: { x: 400, y: 100 } },
  { id: 'node-3', label: 'ElasticSearch', position: { x: 700, y: 100 } },

  // Edges
  { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true },
  { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true }
]

const elements = ref(initialElements)
const loading = ref(false)
const executionStatus = ref('Idle')
const logs = ref('')

const executeWorkflow = async () => {
  loading.value = true
  executionStatus.value = 'Running...'
  logs.value = ''

  try {
    // Send the n8n-compatible JSON to the backend
    const response = await axios.post('http://localhost:8080/api/workflow/execute', n8nWorkflowData)
    logs.value = response.data
    executionStatus.value = 'Success'
  } catch (error: any) {
    console.error(error)
    executionStatus.value = 'Failed'
    logs.value = 'Error executing workflow: ' + (error.response?.data?.message || error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.workflow-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  padding: 10px;
  background: #f0f2f5;
  border-bottom: 1px solid #d9d9d9;
}

.editor-area {
  flex: 1;
  background: #fff;
}

.logs-area {
  height: 200px;
  background: #1e1e1e;
  color: #fff;
  padding: 10px;
  overflow-y: auto;
  border-top: 1px solid #333;
}

.basicflow {
  background: #fafafa;
}
</style>
