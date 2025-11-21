<template>
  <div class="executions-tab">
    <!-- Filters -->
    <div class="executions-filters">
      <a-input
        v-model:value="searchQuery"
        placeholder="Search executions..."
        style="width: 240px"
      >
        <template #prefix>
          <SearchOutlined style="color: #9CA3AF" />
        </template>
      </a-input>

      <a-select v-model:value="statusFilter" placeholder="All Statuses" style="width: 150px" allowClear>
        <a-select-option value="success">Success</a-select-option>
        <a-select-option value="error">Error</a-select-option>
        <a-select-option value="running">Running</a-select-option>
        <a-select-option value="waiting">Waiting</a-select-option>
      </a-select>

      <a-range-picker v-model:value="dateRange" style="width: 280px" />

      <a-button @click="refreshExecutions">
        <ReloadOutlined />
        Refresh
      </a-button>
    </div>

    <!-- Executions Table -->
    <a-table
      :columns="columns"
      :data-source="filteredExecutions"
      :pagination="{ pageSize: 20, showSizeChanger: true, showTotal: (total: number) => `Total ${total} executions` }"
      :loading="loading"
      row-key="id"
      class="executions-table"
      @row-click="handleRowClick"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            <template #icon>
              <CheckCircleFilled v-if="record.status === 'success'" />
              <CloseCircleFilled v-else-if="record.status === 'error'" />
              <SyncOutlined v-else-if="record.status === 'running'" spin />
              <ClockCircleOutlined v-else />
            </template>
            {{ record.status }}
          </a-tag>
        </template>

        <template v-else-if="column.key === 'startedAt'">
          <span class="date-text">{{ formatDate(record.startedAt) }}</span>
        </template>

        <template v-else-if="column.key === 'duration'">
          <span class="duration-text">{{ record.duration }}</span>
        </template>

        <template v-else-if="column.key === 'mode'">
          <a-tag>{{ record.mode }}</a-tag>
        </template>

        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-tooltip title="View Details">
              <a-button type="text" size="small" @click.stop="viewExecution(record)">
                <EyeOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="Retry">
              <a-button
                type="text"
                size="small"
                :disabled="record.status !== 'error'"
                @click.stop="retryExecution(record)"
              >
                <RedoOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="Delete">
              <a-button type="text" size="small" danger @click.stop="deleteExecution(record)">
                <DeleteOutlined />
              </a-button>
            </a-tooltip>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- Execution Detail Drawer -->
    <a-drawer
      v-model:open="detailDrawerVisible"
      title="Execution Details"
      :width="600"
      placement="right"
    >
      <template v-if="selectedExecution">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="ID">{{ selectedExecution.id }}</a-descriptions-item>
          <a-descriptions-item label="Status">
            <a-tag :color="getStatusColor(selectedExecution.status)">
              {{ selectedExecution.status }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Started">{{ formatDate(selectedExecution.startedAt) }}</a-descriptions-item>
          <a-descriptions-item label="Finished">{{ formatDate(selectedExecution.finishedAt) }}</a-descriptions-item>
          <a-descriptions-item label="Duration">{{ selectedExecution.duration }}</a-descriptions-item>
          <a-descriptions-item label="Mode">{{ selectedExecution.mode }}</a-descriptions-item>
        </a-descriptions>

        <a-divider>Node Executions</a-divider>

        <a-timeline>
          <a-timeline-item
            v-for="node in selectedExecution.nodeExecutions"
            :key="node.name"
            :color="node.status === 'success' ? 'green' : node.status === 'error' ? 'red' : 'blue'"
          >
            <div class="timeline-node">
              <div class="timeline-header">
                <span class="node-name">{{ node.name }}</span>
                <span class="node-duration">{{ node.duration }}</span>
              </div>
              <div class="timeline-info">
                <span>{{ node.itemsProcessed }} items processed</span>
              </div>
              <div v-if="node.error" class="timeline-error">
                {{ node.error }}
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>

        <a-divider>Data</a-divider>

        <a-tabs v-model:activeKey="detailTab" size="small">
          <a-tab-pane key="input" tab="Input Data">
            <pre class="json-view">{{ JSON.stringify(selectedExecution.inputData, null, 2) }}</pre>
          </a-tab-pane>
          <a-tab-pane key="output" tab="Output Data">
            <pre class="json-view">{{ JSON.stringify(selectedExecution.outputData, null, 2) }}</pre>
          </a-tab-pane>
        </a-tabs>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Dayjs } from 'dayjs';
import {
  SearchOutlined,
  ReloadOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  SyncOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  RedoOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';

interface NodeExecution {
  name: string;
  status: string;
  duration: string;
  itemsProcessed: number;
  error?: string;
}

interface Execution {
  id: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  startedAt: string;
  finishedAt: string;
  duration: string;
  mode: string;
  nodeExecutions: NodeExecution[];
  inputData: unknown;
  outputData: unknown;
}

const searchQuery = ref('');
const statusFilter = ref<string | undefined>(undefined);
const dateRange = ref<[Dayjs, Dayjs] | null>(null);
const loading = ref(false);
const detailDrawerVisible = ref(false);
const selectedExecution = ref<Execution | null>(null);
const detailTab = ref('input');

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 120 },
  { title: 'Status', key: 'status', width: 120 },
  { title: 'Started At', key: 'startedAt', width: 180 },
  { title: 'Duration', key: 'duration', width: 100 },
  { title: 'Mode', key: 'mode', width: 100 },
  { title: 'Actions', key: 'actions', width: 120, fixed: 'right' as const },
];

// Mock executions data
const executions = ref<Execution[]>([
  {
    id: 'exec-001',
    status: 'success',
    startedAt: '2024-01-15T10:00:00Z',
    finishedAt: '2024-01-15T10:00:02Z',
    duration: '2.1s',
    mode: 'Manual',
    nodeExecutions: [
      { name: 'Schedule Trigger', status: 'success', duration: '5ms', itemsProcessed: 1 },
      { name: 'PostgreSQL', status: 'success', duration: '120ms', itemsProcessed: 150 },
      { name: 'Transform', status: 'success', duration: '45ms', itemsProcessed: 150 },
      { name: 'Elasticsearch', status: 'success', duration: '89ms', itemsProcessed: 150 },
    ],
    inputData: { trigger: 'manual' },
    outputData: { processed: 150, indexed: 150 },
  },
  {
    id: 'exec-002',
    status: 'error',
    startedAt: '2024-01-15T09:00:00Z',
    finishedAt: '2024-01-15T09:00:01Z',
    duration: '1.2s',
    mode: 'Scheduled',
    nodeExecutions: [
      { name: 'Schedule Trigger', status: 'success', duration: '3ms', itemsProcessed: 1 },
      { name: 'PostgreSQL', status: 'error', duration: '1.1s', itemsProcessed: 0, error: 'Connection timeout' },
    ],
    inputData: { trigger: 'cron', expression: '0 * * * *' },
    outputData: null,
  },
  {
    id: 'exec-003',
    status: 'success',
    startedAt: '2024-01-15T08:00:00Z',
    finishedAt: '2024-01-15T08:00:03Z',
    duration: '3.5s',
    mode: 'Scheduled',
    nodeExecutions: [
      { name: 'Schedule Trigger', status: 'success', duration: '2ms', itemsProcessed: 1 },
      { name: 'PostgreSQL', status: 'success', duration: '200ms', itemsProcessed: 500 },
      { name: 'Transform', status: 'success', duration: '150ms', itemsProcessed: 500 },
      { name: 'If Condition', status: 'success', duration: '5ms', itemsProcessed: 500 },
      { name: 'Elasticsearch', status: 'success', duration: '3s', itemsProcessed: 320 },
    ],
    inputData: { trigger: 'cron' },
    outputData: { processed: 500, indexed: 320 },
  },
  {
    id: 'exec-004',
    status: 'running',
    startedAt: '2024-01-15T10:30:00Z',
    finishedAt: '',
    duration: '-',
    mode: 'Manual',
    nodeExecutions: [
      { name: 'Schedule Trigger', status: 'success', duration: '2ms', itemsProcessed: 1 },
      { name: 'PostgreSQL', status: 'running', duration: '-', itemsProcessed: 0 },
    ],
    inputData: { trigger: 'manual' },
    outputData: null,
  },
]);

const filteredExecutions = computed(() => {
  return executions.value.filter(exec => {
    if (searchQuery.value && !exec.id.includes(searchQuery.value)) {
      return false;
    }
    if (statusFilter.value && exec.status !== statusFilter.value) {
      return false;
    }
    return true;
  });
});

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    success: 'success',
    error: 'error',
    running: 'processing',
    waiting: 'default',
  };
  return colors[status] || 'default';
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
}

function refreshExecutions() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
}

function handleRowClick(record: Execution) {
  viewExecution(record);
}

function viewExecution(execution: Execution) {
  selectedExecution.value = execution;
  detailDrawerVisible.value = true;
}

function retryExecution(execution: Execution) {
  console.log('Retrying execution:', execution.id);
}

function deleteExecution(execution: Execution) {
  console.log('Deleting execution:', execution.id);
}
</script>

<style lang="scss" scoped>
.executions-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: #F9FAFB;
}

.executions-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.executions-table {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  :deep(.ant-table) {
    border-radius: 8px;
  }

  :deep(.ant-table-row) {
    cursor: pointer;

    &:hover {
      background: #FFF7ED;
    }
  }
}

.date-text {
  font-size: 13px;
  color: #6B7280;
}

.duration-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #111827;
}

.timeline-node {
  padding: 4px 0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.node-name {
  font-weight: 500;
  color: #111827;
}

.node-duration {
  font-family: monospace;
  font-size: 12px;
  color: #6B7280;
}

.timeline-info {
  font-size: 12px;
  color: #6B7280;
  margin-top: 4px;
}

.timeline-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: #FEF2F2;
  border-radius: 4px;
  font-size: 12px;
  color: #DC2626;
}

.json-view {
  margin: 0;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  max-height: 300px;
  overflow: auto;
}
</style>
