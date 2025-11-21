<template>
  <a-drawer
    :open="!!node"
    :title="node?.name || 'Node Configuration'"
    width="360"
    @close="emit('close')"
  >
    <template v-if="node">
      <a-form layout="vertical">
        <a-form-item label="Name">
          <a-input v-model:value="formState.name" />
        </a-form-item>

        <!-- PostgreSQL Config -->
        <template v-if="node.type === 'postgres'">
          <a-form-item label="Operation">
            <a-select v-model:value="formState.parameters.operation">
              <a-select-option value="select">Select</a-select-option>
              <a-select-option value="insert">Insert</a-select-option>
              <a-select-option value="update">Update</a-select-option>
              <a-select-option value="delete">Delete</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Table">
            <a-input v-model:value="formState.parameters.table" placeholder="table_name" />
          </a-form-item>
          <a-form-item label="Query">
            <a-textarea v-model:value="formState.parameters.query" :rows="3" placeholder="SELECT * FROM users" />
          </a-form-item>
        </template>

        <!-- Elasticsearch Config -->
        <template v-if="node.type === 'elasticsearch'">
          <a-form-item label="Operation">
            <a-select v-model:value="formState.parameters.operation">
              <a-select-option value="search">Search</a-select-option>
              <a-select-option value="index">Index Document</a-select-option>
              <a-select-option value="update">Update</a-select-option>
              <a-select-option value="delete">Delete</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Index">
            <a-input v-model:value="formState.parameters.index" placeholder="index_name" />
          </a-form-item>
          <a-form-item label="Query (JSON)">
            <a-textarea v-model:value="formState.parameters.query" :rows="4" placeholder='{"match_all": {}}' />
          </a-form-item>
        </template>

        <!-- Transform Config -->
        <template v-if="node.type === 'transform'">
          <a-form-item label="Mode">
            <a-select v-model:value="formState.parameters.mode">
              <a-select-option value="mapFields">Map Fields</a-select-option>
              <a-select-option value="expression">Expression</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Expression">
            <a-textarea v-model:value="formState.parameters.expression" :rows="3" placeholder="item.field" />
          </a-form-item>
        </template>

        <!-- If Condition Config -->
        <template v-if="node.type === 'if'">
          <a-form-item label="Condition">
            <a-input v-model:value="formState.parameters.condition" placeholder='status === "active"' />
          </a-form-item>
          <a-form-item label="Combine">
            <a-select v-model:value="formState.parameters.combineOperation">
              <a-select-option value="all">AND</a-select-option>
              <a-select-option value="any">OR</a-select-option>
            </a-select>
          </a-form-item>
        </template>

        <!-- Schedule Trigger Config -->
        <template v-if="node.type === 'scheduleTrigger'">
          <a-form-item label="Trigger Rule">
            <a-select v-model:value="formState.parameters.rule">
              <a-select-option value="interval">Interval</a-select-option>
              <a-select-option value="cron">Cron Expression</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Cron Expression">
            <a-input v-model:value="formState.parameters.cron" placeholder="0 * * * *" />
          </a-form-item>
        </template>

        <!-- Switch Config -->
        <template v-if="node.type === 'switch'">
          <a-form-item label="Value to Match">
            <a-input v-model:value="formState.parameters.dataPropertyName" placeholder="fieldName" />
          </a-form-item>
          <a-form-item label="Fallback Output">
            <a-select v-model:value="formState.parameters.fallbackOutput">
              <a-select-option value="none">None</a-select-option>
              <a-select-option value="extra">Extra Output</a-select-option>
            </a-select>
          </a-form-item>
        </template>
      </a-form>
    </template>

    <template #footer>
      <a-space>
        <a-button @click="emit('close')">Cancel</a-button>
        <a-button type="primary" @click="handleSave">Save</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { INode } from '@/types/workflow';

const props = defineProps<{
  node: INode | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [updates: Partial<INode>];
}>();

const formState = reactive({
  name: '',
  parameters: {} as Record<string, unknown>,
});

watch(
  () => props.node,
  (node) => {
    if (node) {
      formState.name = node.name;
      formState.parameters = { ...node.parameters };
    }
  },
  { immediate: true }
);

function handleSave() {
  emit('save', {
    name: formState.name,
    parameters: { ...formState.parameters },
  });
  emit('close');
}
</script>
