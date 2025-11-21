<template>
  <div v-if="node" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <button class="back-btn" @click="handleClose">
          <LeftOutlined />
          Back to canvas
        </button>
        <div class="header-title">
          <div class="node-icon" :style="{ backgroundColor: nodeColor + '20', color: nodeColor }">
            <component :is="nodeIcon" />
          </div>
          <span>{{ nodeTypeDisplay }}</span>
        </div>
        <button class="execute-btn" @click="executeNode">
          <ThunderboltOutlined />
          Execute step
        </button>
      </div>

      <!-- Three Column Layout -->
      <div class="modal-body">
        <!-- Left Panel - Input -->
        <div class="panel input-panel">
          <div class="panel-header">
            <span class="panel-title">INPUT</span>
          </div>
          <div class="panel-tabs">
            <button
              v-for="tab in ['Schema', 'Table', 'JSON']"
              :key="tab"
              :class="['tab-btn', { active: inputTab === tab }]"
              @click="inputTab = tab"
            >
              {{ tab }}
            </button>
          </div>
          <div class="panel-content">
            <div class="input-section">
              <div class="section-header" @click="toggleSection('trigger')">
                <CaretRightOutlined :class="{ rotated: expandedSections.trigger }" />
                <span class="section-title">When clicking "Execute workflow"</span>
                <span class="trigger-badge">Trigger</span>
              </div>
              <div v-show="expandedSections.trigger" class="section-content">
                <div class="input-item">
                  <PlayCircleOutlined />
                  <span>Execute previous nodes</span>
                  <span class="helper-text">to view input data</span>
                </div>
              </div>
            </div>
            <div class="input-section">
              <div class="section-header" @click="toggleSection('variables')">
                <CaretRightOutlined :class="{ rotated: expandedSections.variables }" />
                <span class="section-title">Variables and context</span>
              </div>
              <div v-show="expandedSections.variables" class="section-content">
                <div class="empty-state">No variables defined</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Center Panel - Configuration -->
        <div class="panel config-panel">
          <div class="panel-header">
            <div class="config-tabs">
              <button
                :class="['tab-btn', { active: configTab === 'parameters' }]"
                @click="configTab = 'parameters'"
              >
                Parameters
              </button>
              <button
                :class="['tab-btn', { active: configTab === 'settings' }]"
                @click="configTab = 'settings'"
              >
                Settings
              </button>
            </div>
            <a href="#" class="docs-link">
              <FileTextOutlined />
              Docs
            </a>
          </div>
          <div class="panel-content config-content">
            <div v-if="configTab === 'parameters'" class="config-form">
              <!-- PostgreSQL Config -->
              <template v-if="node.type === 'n8n-nodes-base.postgres'">
                <div class="form-group">
                  <label>Credential to connect with</label>
                  <div class="credential-select">
                    <a-select v-model:value="localNode.parameters.credential" style="flex: 1">
                      <a-select-option value="postgres-main">Postgres account</a-select-option>
                      <a-select-option value="postgres-dev">Postgres Dev</a-select-option>
                    </a-select>
                    <button class="edit-btn"><EditOutlined /></button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Operation</label>
                  <a-select v-model:value="localNode.parameters.operation">
                    <a-select-option value="select">Execute Query</a-select-option>
                    <a-select-option value="insert">Insert</a-select-option>
                    <a-select-option value="update">Update</a-select-option>
                    <a-select-option value="delete">Delete</a-select-option>
                  </a-select>
                </div>
                <div class="form-group">
                  <label>Query</label>
                  <div class="code-editor">
                    <div class="line-numbers">
                      <span v-for="n in queryLines" :key="n">{{ n }}</span>
                    </div>
                    <textarea
                      v-model="localNode.parameters.query"
                      class="code-input"
                      placeholder="SELECT * FROM users WHERE active = true"
                      @input="updateQueryLines"
                    ></textarea>
                  </div>
                  <p class="form-hint">
                    Consider using query parameters to prevent SQL injection attacks. Add them in the options below
                  </p>
                </div>
              </template>

              <!-- Elasticsearch Config -->
              <template v-else-if="node.type === 'n8n-nodes-base.elasticsearch'">
                <div class="form-group">
                  <label>Credential to connect with</label>
                  <div class="credential-select">
                    <a-select v-model:value="localNode.parameters.credential" style="flex: 1">
                      <a-select-option value="es-main">Elasticsearch account</a-select-option>
                    </a-select>
                    <button class="edit-btn"><EditOutlined /></button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Operation</label>
                  <a-select v-model:value="localNode.parameters.operation">
                    <a-select-option value="search">Search</a-select-option>
                    <a-select-option value="index">Index Document</a-select-option>
                    <a-select-option value="delete">Delete Document</a-select-option>
                  </a-select>
                </div>
                <div class="form-group">
                  <label>Index</label>
                  <a-input v-model:value="localNode.parameters.index" placeholder="my-index" />
                </div>
                <div class="form-group" v-if="localNode.parameters.operation === 'search'">
                  <label>Query</label>
                  <div class="code-editor">
                    <div class="line-numbers">
                      <span v-for="n in queryLines" :key="n">{{ n }}</span>
                    </div>
                    <textarea
                      v-model="localNode.parameters.query"
                      class="code-input"
                      placeholder='{"match_all": {}}'
                      @input="updateQueryLines"
                    ></textarea>
                  </div>
                </div>
              </template>

              <!-- Transform Config -->
              <template v-else-if="node.type === 'n8n-nodes-base.transform'">
                <div class="form-group">
                  <label>Mode</label>
                  <a-select v-model:value="localNode.parameters.mode">
                    <a-select-option value="map">Map Fields</a-select-option>
                    <a-select-option value="filter">Filter</a-select-option>
                    <a-select-option value="expression">Expression</a-select-option>
                  </a-select>
                </div>
                <div class="form-group">
                  <label>Expression</label>
                  <div class="code-editor">
                    <div class="line-numbers">
                      <span v-for="n in queryLines" :key="n">{{ n }}</span>
                    </div>
                    <textarea
                      v-model="localNode.parameters.expression"
                      class="code-input"
                      placeholder="items.map(item => ({ ...item, processed: true }))"
                      @input="updateQueryLines"
                    ></textarea>
                  </div>
                </div>
              </template>

              <!-- If Condition Config -->
              <template v-else-if="node.type === 'n8n-nodes-base.if'">
                <div class="form-group">
                  <label>Condition</label>
                  <a-select v-model:value="localNode.parameters.condition">
                    <a-select-option value="equals">Equals</a-select-option>
                    <a-select-option value="notEquals">Not Equals</a-select-option>
                    <a-select-option value="contains">Contains</a-select-option>
                    <a-select-option value="greaterThan">Greater Than</a-select-option>
                    <a-select-option value="lessThan">Less Than</a-select-option>
                  </a-select>
                </div>
                <div class="form-group">
                  <label>Value 1</label>
                  <a-input v-model:value="localNode.parameters.value1" placeholder="{{ $json.field }}" />
                </div>
                <div class="form-group">
                  <label>Value 2</label>
                  <a-input v-model:value="localNode.parameters.value2" placeholder="Expected value" />
                </div>
              </template>

              <!-- Schedule Trigger Config -->
              <template v-else-if="node.type === 'n8n-nodes-base.scheduleTrigger'">
                <div class="form-group">
                  <label>Trigger Mode</label>
                  <a-select v-model:value="localNode.parameters.mode">
                    <a-select-option value="cron">Cron Expression</a-select-option>
                    <a-select-option value="interval">Every X Minutes</a-select-option>
                  </a-select>
                </div>
                <div class="form-group" v-if="localNode.parameters.mode === 'cron'">
                  <label>Cron Expression</label>
                  <a-input v-model:value="localNode.parameters.cronExpression" placeholder="0 * * * *" />
                </div>
                <div class="form-group" v-else>
                  <label>Interval (minutes)</label>
                  <a-input-number v-model:value="localNode.parameters.interval" :min="1" style="width: 100%" />
                </div>
              </template>

              <!-- Options Section -->
              <div class="form-group options-section">
                <label>Options</label>
                <p class="no-options">No properties</p>
                <a-dropdown>
                  <a-button>
                    Add option
                    <DownOutlined />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item>Query Parameters</a-menu-item>
                      <a-menu-item>Timeout</a-menu-item>
                      <a-menu-item>Retry on Fail</a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>

            <div v-else class="settings-form">
              <div class="form-group">
                <label>Node Name</label>
                <a-input v-model:value="localNode.name" />
              </div>
              <div class="form-group">
                <label>Notes</label>
                <a-textarea v-model:value="localNode.parameters.notes" :rows="4" placeholder="Add notes about this node..." />
              </div>
              <div class="form-group">
                <a-checkbox v-model:checked="localNode.parameters.continueOnFail">
                  Continue on Fail
                </a-checkbox>
                <p class="form-hint">Continue workflow execution even if this node fails</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Output -->
        <div class="panel output-panel">
          <div class="panel-header">
            <span class="panel-title">OUTPUT</span>
          </div>
          <div class="panel-tabs">
            <button
              v-for="tab in ['Schema', 'Table', 'JSON']"
              :key="tab"
              :class="['tab-btn', { active: outputTab === tab }]"
              @click="outputTab = tab"
            >
              {{ tab }}
            </button>
            <button class="tab-btn edit-output-btn">
              <EditOutlined />
            </button>
          </div>
          <div class="panel-content">
            <div v-if="!hasOutput" class="output-empty">
              <p>Execute this node to view data</p>
              <a href="#" class="mock-data-link">or set mock data</a>
            </div>
            <div v-else class="output-data">
              <pre v-if="outputTab === 'JSON'" class="json-output">{{ JSON.stringify(outputData, null, 2) }}</pre>
              <a-table
                v-else-if="outputTab === 'Table'"
                :columns="outputColumns"
                :data-source="outputData"
                :pagination="false"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <div class="footer-left">
          <a-avatar :size="28" style="background-color: #FF8A3D">U</a-avatar>
          <span class="user-name">User</span>
          <button class="logs-btn">
            <FileTextOutlined />
            Logs
          </button>
        </div>
        <div class="footer-right">
          <span class="feedback-text">I wish this node would...</span>
          <MessageOutlined />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  LeftOutlined,
  ThunderboltOutlined,
  CaretRightOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  EditOutlined,
  DownOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  SearchOutlined,
  SwapOutlined,
  BranchesOutlined,
} from '@ant-design/icons-vue';
import type { INode } from '@/types/workflow';
import { NODE_TYPES } from '@/types/workflow';

const props = defineProps<{
  node: INode | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [node: Partial<INode>];
}>();

const localNode = ref<INode>({
  id: '',
  name: '',
  type: '',
  typeVersion: 1,
  position: [0, 0],
  parameters: {},
});

const inputTab = ref('Table');
const outputTab = ref('Table');
const configTab = ref('parameters');
const queryLines = ref(1);
const hasOutput = ref(false);
const outputData = ref<Record<string, unknown>[]>([]);

const expandedSections = ref({
  trigger: true,
  variables: false,
});

watch(() => props.node, (newNode) => {
  if (newNode) {
    localNode.value = JSON.parse(JSON.stringify(newNode));
    updateQueryLines();
  }
}, { immediate: true });

const nodeTypeInfo = computed(() => {
  if (!props.node) return null;
  return NODE_TYPES[props.node.type];
});

const nodeColor = computed(() => nodeTypeInfo.value?.color || '#6B7280');
const nodeTypeDisplay = computed(() => nodeTypeInfo.value?.displayName || props.node?.type || '');

const nodeIcon = computed(() => {
  const iconMap: Record<string, unknown> = {
    'n8n-nodes-base.scheduleTrigger': ClockCircleOutlined,
    'n8n-nodes-base.postgres': DatabaseOutlined,
    'n8n-nodes-base.elasticsearch': SearchOutlined,
    'n8n-nodes-base.transform': SwapOutlined,
    'n8n-nodes-base.if': BranchesOutlined,
  };
  return iconMap[props.node?.type || ''] || DatabaseOutlined;
});

const outputColumns = computed(() => {
  if (outputData.value.length === 0) return [];
  return Object.keys(outputData.value[0]).map(key => ({
    title: key,
    dataIndex: key,
    key,
  }));
});

function toggleSection(section: 'trigger' | 'variables') {
  expandedSections.value[section] = !expandedSections.value[section];
}

function updateQueryLines() {
  const query = localNode.value.parameters.query || localNode.value.parameters.expression || '';
  queryLines.value = Math.max(1, (query.match(/\n/g) || []).length + 1);
}

function handleClose() {
  emit('save', {
    name: localNode.value.name,
    parameters: localNode.value.parameters,
  });
  emit('close');
}

function executeNode() {
  // Mock execution
  hasOutput.value = true;
  outputData.value = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', status: 'inactive' },
  ];
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-container {
  width: 90vw;
  height: 85vh;
  max-width: 1400px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #6B7280;
  color: #fff;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 500;
}

.node-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.execute-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FF6B6B;
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: #E55A5A;
  }
}

.modal-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.input-panel,
.output-panel {
  width: 280px;
  flex-shrink: 0;
  background: #F3F4F6;
  border-right: 1px solid #E5E7EB;
}

.output-panel {
  border-right: none;
  border-left: 1px solid #E5E7EB;
}

.config-panel {
  flex: 1;
  background: #fff;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 11px;
  font-weight: 600;
  color: #6B7280;
  letter-spacing: 0.5px;
}

.panel-tabs {
  display: flex;
  padding: 0 12px;
  border-bottom: 1px solid #E5E7EB;
  background: #fff;
}

.tab-btn {
  padding: 10px 12px;
  font-size: 13px;
  color: #6B7280;
  background: transparent;
  border: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;

  &:hover {
    color: #111827;
  }

  &.active {
    color: #FF8A3D;
    border-bottom-color: #FF8A3D;
  }
}

.edit-output-btn {
  margin-left: auto;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.input-section {
  margin-bottom: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #111827;

  .anticon {
    font-size: 10px;
    color: #6B7280;
    transition: transform 0.2s;

    &.rotated {
      transform: rotate(90deg);
    }
  }
}

.section-title {
  flex: 1;
}

.trigger-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #FEE2E2;
  color: #DC2626;
  border-radius: 4px;
}

.section-content {
  padding: 8px 12px 8px 32px;
}

.input-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;

  .anticon {
    color: #9CA3AF;
  }

  .helper-text {
    color: #9CA3AF;
    font-size: 12px;
  }
}

.empty-state {
  font-size: 13px;
  color: #9CA3AF;
}

.config-tabs {
  display: flex;
  gap: 4px;
}

.docs-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6B7280;
  text-decoration: none;

  &:hover {
    color: #FF8A3D;
  }
}

.config-content {
  padding: 20px;
}

.config-form,
.settings-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
  }
}

.credential-select {
  display: flex;
  gap: 8px;
}

.edit-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;

  &:hover {
    border-color: #FF8A3D;
    color: #FF8A3D;
  }
}

.code-editor {
  display: flex;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  overflow: hidden;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
}

.line-numbers {
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
  background: #F9FAFB;
  color: #9CA3AF;
  text-align: right;
  user-select: none;
  border-right: 1px solid #E5E7EB;
  min-width: 40px;
}

.code-input {
  flex: 1;
  padding: 12px;
  border: none;
  outline: none;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
}

.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #9CA3AF;
}

.options-section {
  border-top: 1px solid #E5E7EB;
  padding-top: 20px;
  margin-top: 20px;
}

.no-options {
  font-size: 13px;
  color: #9CA3AF;
  margin-bottom: 12px;
}

.output-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;

  p {
    font-size: 13px;
    color: #6B7280;
    margin-bottom: 8px;
  }
}

.mock-data-link {
  font-size: 13px;
  color: #FF8A3D;

  &:hover {
    text-decoration: underline;
  }
}

.output-data {
  height: 100%;
}

.json-output {
  margin: 0;
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow: auto;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #F3F4F6;
  border-top: 1px solid #E5E7EB;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 13px;
  color: #374151;
}

.logs-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;

  &:hover {
    border-color: #9CA3AF;
  }
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #9CA3AF;
}
</style>
