<template>
  <div class="logs-panel" :class="{ expanded: isExpanded }">
    <!-- Collapsed bar -->
    <div class="logs-bar" @click="toggleExpand">
      <div class="logs-bar-left">
        <UpOutlined v-if="isExpanded" class="toggle-icon" />
        <DownOutlined v-else class="toggle-icon" />
        <span class="logs-title">Logs</span>
      </div>
      <div class="logs-bar-right">
        <span class="last-run" v-if="lastRun">
          Last run:
          <span :class="['status-text', lastRun.status]">{{ lastRun.status }}</span>
          · {{ lastRun.duration }}
        </span>
      </div>
    </div>

    <!-- Expanded content -->
    <div class="logs-content" v-show="isExpanded">
      <a-tabs v-model:activeKey="activeTab" size="small">
        <a-tab-pane key="summary" tab="Summary">
          <div class="summary-content">
            <div class="summary-item" v-for="node in executionSummary" :key="node.name">
              <CheckCircleFilled v-if="node.status === 'success'" class="status-icon success" />
              <ExclamationCircleFilled v-else-if="node.status === 'error'" class="status-icon error" />
              <span class="node-name">{{ node.name }}</span>
              <span class="node-duration">{{ node.duration }}</span>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="nodeLogs" tab="Node Logs">
          <div class="node-logs">
            <div class="logs-sidebar">
              <div
                v-for="node in executionSummary"
                :key="node.name"
                class="log-node-item"
                :class="{ active: selectedLogNode === node.name }"
                @click="selectedLogNode = node.name"
              >
                {{ node.name }}
              </div>
            </div>
            <div class="logs-detail">
              <pre class="log-output">{{ getNodeLogs(selectedLogNode) }}</pre>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="raw" tab="Raw">
          <pre class="raw-logs">{{ rawLogs }}</pre>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  UpOutlined,
  DownOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
} from '@ant-design/icons-vue';

const isExpanded = ref(false);
const activeTab = ref('summary');
const selectedLogNode = ref('Schedule Trigger');

const lastRun = ref({
  status: 'Success',
  duration: '200ms',
});

const executionSummary = ref([
  { name: 'Schedule Trigger', status: 'success', duration: '5ms' },
  { name: 'PostgreSQL', status: 'success', duration: '120ms' },
  { name: 'Transform', status: 'success', duration: '15ms' },
  { name: 'If Condition', status: 'success', duration: '2ms' },
  { name: 'Elasticsearch', status: 'success', duration: '58ms' },
]);

const rawLogs = ref(`[2024-01-15 10:00:00] Starting workflow execution
[2024-01-15 10:00:00] Executing node: Schedule Trigger
[2024-01-15 10:00:00] Node completed: Schedule Trigger (5ms)
[2024-01-15 10:00:00] Executing node: PostgreSQL
[2024-01-15 10:00:00] Query: SELECT * FROM users WHERE active = true
[2024-01-15 10:00:00] Rows returned: 150
[2024-01-15 10:00:00] Node completed: PostgreSQL (120ms)
[2024-01-15 10:00:00] Workflow completed successfully (200ms)`);

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

function getNodeLogs(nodeName: string): string {
  return `Node: ${nodeName}
Status: Success
Duration: ${executionSummary.value.find(n => n.name === nodeName)?.duration || 'N/A'}

Output:
{
  "data": [...],
  "items": 150
}`;
}
</script>

<style lang="scss" scoped>
.logs-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #E5E7EB;
  z-index: 20;
  transition: height 0.3s ease;
  height: 40px;

  &.expanded {
    height: 35%;
    min-height: 200px;
  }
}

.logs-bar {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #F9FAFB;
  }
}

.logs-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-icon {
  font-size: 12px;
  color: #6B7280;
}

.logs-title {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}

.logs-bar-right {
  display: flex;
  align-items: center;
}

.last-run {
  font-size: 12px;
  color: #6B7280;
}

.status-text {
  font-weight: 500;

  &.Success { color: #2EAD5F; }
  &.Error { color: #E54848; }
}

.logs-content {
  height: calc(100% - 40px);
  overflow: hidden;
  padding: 0 16px 16px;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #F9FAFB;
  border-radius: 6px;
}

.status-icon {
  font-size: 14px;

  &.success { color: #2EAD5F; }
  &.error { color: #E54848; }
}

.node-name {
  flex: 1;
  font-size: 13px;
  color: #111827;
}

.node-duration {
  font-size: 12px;
  color: #6B7280;
  font-family: monospace;
}

.node-logs {
  display: flex;
  height: calc(100% - 46px);
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  overflow: hidden;
}

.logs-sidebar {
  width: 200px;
  border-right: 1px solid #E5E7EB;
  overflow-y: auto;
}

.log-node-item {
  padding: 10px 12px;
  font-size: 13px;
  color: #6B7280;
  cursor: pointer;
  border-bottom: 1px solid #F3F4F6;

  &:hover {
    background: #F9FAFB;
  }

  &.active {
    background: #FFF7ED;
    color: #FF8A3D;
    font-weight: 500;
  }
}

.logs-detail {
  flex: 1;
  overflow: auto;
  background: #F9FAFB;
}

.log-output,
.raw-logs {
  margin: 0;
  padding: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
}

.raw-logs {
  height: calc(100% - 46px);
  overflow: auto;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
}
</style>
