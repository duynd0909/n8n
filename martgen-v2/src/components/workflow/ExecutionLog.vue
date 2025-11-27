<template>
  <div :class="['execution-log', { expanded: isExpanded }]">
    <!-- Header / Collapsed State -->
    <div class="log-header" @click="toggleExpanded">
      <div class="header-left">
        <span class="header-title">Logs</span>
        <span v-if="!isExpanded && executionSummary" class="header-summary">
          {{ executionSummary }}
        </span>
      </div>

      <div class="header-right">
        <a-button
          v-if="isExpanded"
          type="text"
          size="small"
          class="clear-btn"
          @click.stop="clearLogs"
        >
          Clear
        </a-button>
        <UpOutlined v-if="isExpanded" class="toggle-icon" />
        <DownOutlined v-else class="toggle-icon" />
      </div>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="log-content">
      <a-tabs v-model:activeKey="activeTab" class="log-tabs">
        <!-- Summary Tab -->
        <a-tab-pane key="summary" tab="Summary">
          <div class="summary-content">
            <div v-if="currentExecution" class="summary-grid">
              <div class="summary-item">
                <label>Status</label>
                <a-tag :color="getStatusColor(currentExecution.status)">
                  {{ currentExecution.status.toUpperCase() }}
                </a-tag>
              </div>

              <div class="summary-item">
                <label>Started</label>
                <span>{{ formatTime(currentExecution.startedAt) }}</span>
              </div>

              <div v-if="currentExecution.finishedAt" class="summary-item">
                <label>Duration</label>
                <span>{{
                  calculateDuration(
                    currentExecution.startedAt,
                    currentExecution.finishedAt
                  )
                }}</span>
              </div>

              <div class="summary-item">
                <label>Nodes Executed</label>
                <span
                  >{{ Object.keys(currentExecution.runData).length }} /
                  {{ totalNodes }}</span
                >
              </div>
            </div>

            <div v-else class="no-execution">No active execution</div>
          </div>
        </a-tab-pane>

        <!-- Node Logs Tab -->
        <a-tab-pane key="nodes" tab="Node Logs">
          <div class="node-logs-content">
            <div class="node-logs-layout">
              <!-- Left: Node List -->
              <div class="node-list">
                <div
                  v-for="node in workflowStore.nodes"
                  :key="node.id"
                  :class="[
                    'node-list-item',
                    {
                      selected: selectedNodeId === node.id,
                      success: getNodeStatus(node.id) === 'success',
                      error: getNodeStatus(node.id) === 'error',
                      running: getNodeStatus(node.id) === 'running',
                    },
                  ]"
                  @click="selectedNodeId = node.id"
                >
                  <div class="node-status-indicator">
                    <CheckCircleOutlined
                      v-if="getNodeStatus(node.id) === 'success'"
                    />
                    <CloseCircleOutlined
                      v-else-if="getNodeStatus(node.id) === 'error'"
                    />
                    <LoadingOutlined
                      v-else-if="getNodeStatus(node.id) === 'running'"
                    />
                    <MinusCircleOutlined v-else />
                  </div>
                  <span class="node-name">{{ node.name }}</span>
                </div>
              </div>

              <!-- Right: Logs for Selected Node -->
              <div class="node-log-details">
                <div v-if="selectedNodeId" class="log-entries">
                  <div
                    v-for="(log, idx) in getSelectedNodeLogs"
                    :key="idx"
                    :class="['log-entry', log.level]"
                  >
                    <span class="log-timestamp">{{
                      formatLogTime(log.timestamp)
                    }}</span>
                    <span :class="['log-level', log.level]">{{
                      log.level.toUpperCase()
                    }}</span>
                    <span class="log-message">{{ log.message }}</span>
                  </div>

                  <div v-if="getSelectedNodeLogs.length === 0" class="no-logs">
                    No logs for this node
                  </div>
                </div>
                <div v-else class="no-node-selected">
                  Select a node to view logs
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- Raw Logs Tab -->
        <a-tab-pane key="raw" tab="Raw">
          <div class="raw-logs-content">
            <div
              v-for="(log, idx) in executionStore.executionLogs"
              :key="idx"
              :class="['raw-log-entry', log.level]"
            >
              <span class="raw-timestamp">{{ log.timestamp }}</span>
              <span class="raw-node">[{{ log.nodeName }}]</span>
              <span :class="['raw-level', log.level]">{{
                log.level.toUpperCase()
              }}</span>
              <span class="raw-message">{{ log.message }}</span>
            </div>

            <div
              v-if="executionStore.executionLogs.length === 0"
              class="no-logs"
            >
              No logs available
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useExecutionStore } from '@/stores/executionStore';
import {
  UpOutlined,
  DownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons-vue';

const workflowStore = useWorkflowStore();
const executionStore = useExecutionStore();

const isExpanded = ref(false);
const activeTab = ref('summary');
const selectedNodeId = ref<string | null>(null);

const currentExecution = computed(() => executionStore.currentExecution);

const totalNodes = computed(() => workflowStore.nodes.length);

const executionSummary = computed(() => {
  if (!currentExecution.value) return null;

  const status = currentExecution.value.status;
  let duration = '';

  if (currentExecution.value.finishedAt) {
    const ms =
      new Date(currentExecution.value.finishedAt).getTime() -
      new Date(currentExecution.value.startedAt).getTime();
    duration = `${Math.round(ms)}ms`;
  }

  const statusText =
    status === 'success' ? 'Success' : status === 'error' ? 'Error' : 'Running';
  return duration
    ? `Last run: ${statusText} · ${duration}`
    : `Status: ${statusText}`;
});

const getSelectedNodeLogs = computed(() => {
  if (!selectedNodeId.value) return [];
  return executionStore.getNodeLogs(selectedNodeId.value);
});

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function clearLogs() {
  executionStore.clearCurrentExecution();
}

function getNodeStatus(nodeId: string) {
  return executionStore.getNodeStatus(nodeId);
}

function getStatusColor(status: string) {
  switch (status) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'running':
      return 'processing';
    default:
      return 'default';
  }
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleString();
}

function formatLogTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString();
}

function calculateDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
</script>

<style scoped lang="scss">
.execution-log {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: $color-bg;
  border-top: 1px solid $color-border;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  z-index: $z-sticky;
  transition: height $transition-normal;

  &:not(.expanded) {
    height: 40px;
  }

  &.expanded {
    height: 35vh;
  }
}

.log-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-lg;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid $color-border;

  &:hover {
    background: $color-bg-hover;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.header-title {
  font-weight: $font-weight-semibold;
  color: $color-text;
}

.header-summary {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.header-right {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.toggle-icon {
  color: $color-text-secondary;
  font-size: 12px;
}

.clear-btn {
  font-size: $font-size-sm;
}

.log-content {
  height: calc(100% - 40px);
  overflow: hidden;
  padding: 0 $spacing-lg;
}

.log-tabs {
  height: 100%;

  :deep(.ant-tabs-content) {
    height: calc(100% - 46px);
    overflow: hidden;
  }

  :deep(.ant-tabs-tabpane) {
    height: 100%;
    overflow-y: auto;
    background: $color-bg-secondary;
    padding: $spacing-md;
  }
}

// Summary Tab
.summary-content {
  font-family: $font-family-mono;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-lg;
}

.summary-item {
  label {
    display: block;
    font-size: $font-size-xs;
    color: $color-text-secondary;
    margin-bottom: $spacing-xs;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  span {
    font-size: $font-size-md;
    color: $color-text;
  }
}

.no-execution {
  text-align: center;
  padding: $spacing-2xl;
  color: $color-text-secondary;
}

// Node Logs Tab
.node-logs-content {
  height: 100%;
  padding: 0;
  margin: 0;
}

.node-logs-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 0;
  height: 100%;
  background: $color-bg;
}

.node-list {
  border-right: 1px solid $color-border;
  overflow-y: auto;
}

.node-list-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  cursor: pointer;
  border-bottom: 1px solid $color-border-light;
  transition: background $transition-fast;

  &:hover {
    background: $color-bg-hover;
  }

  &.selected {
    background: $color-primary-bg;
    border-left: 2px solid $color-primary;
  }

  &.success .node-status-indicator {
    color: $color-success;
  }

  &.error .node-status-indicator {
    color: $color-error;
  }

  &.running .node-status-indicator {
    color: $color-info;
  }
}

.node-status-indicator {
  font-size: 16px;
  color: $color-text-disabled;
}

.node-name {
  font-size: $font-size-sm;
  color: $color-text;
  font-family: $font-family-mono;
}

.node-log-details {
  overflow-y: auto;
  padding: $spacing-md;
  background: #1e1e1e;
}

.log-entries {
  font-family: $font-family-mono;
  font-size: $font-size-xs;
}

.log-entry {
  padding: $spacing-xs 0;
  display: flex;
  gap: $spacing-sm;
  color: #d4d4d4;
  line-height: 1.6;

  &.error {
    color: #f48771;
  }

  &.warn {
    color: #dcdcaa;
  }

  &.info {
    color: #4ec9b0;
  }
}

.log-timestamp {
  color: #858585;
  flex-shrink: 0;
}

.log-level {
  flex-shrink: 0;
  width: 50px;
  font-weight: $font-weight-semibold;

  &.error {
    color: #f48771;
  }

  &.warn {
    color: #dcdcaa;
  }

  &.info {
    color: #4ec9b0;
  }
}

.log-message {
  flex: 1;
}

.no-logs,
.no-node-selected {
  text-align: center;
  padding: $spacing-2xl;
  color: #858585;
}

// Raw Logs Tab
.raw-logs-content {
  font-family: $font-family-mono;
  font-size: $font-size-xs;
  background: #1e1e1e;
  padding: $spacing-md;
  line-height: 1.6;
}

.raw-log-entry {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-xs 0;
  color: #d4d4d4;

  &.error {
    color: #f48771;
  }

  &.warn {
    color: #dcdcaa;
  }
}

.raw-timestamp {
  color: #858585;
  flex-shrink: 0;
}

.raw-node {
  color: #569cd6;
  flex-shrink: 0;
}

.raw-level {
  flex-shrink: 0;
  width: 50px;
  font-weight: $font-weight-semibold;

  &.error {
    color: #f48771;
  }

  &.warn {
    color: #dcdcaa;
  }

  &.info {
    color: #4ec9b0;
  }
}

.raw-message {
  flex: 1;
}
</style>
