<template>
  <div class="schema-json-view">
    <div v-if="!data" class="empty-state">
      <p>No data available</p>
    </div>

    <div v-else class="json-container">
      <JsonEditorVue
        :model-value="data"
        class="json-viewer"
        :mode="Mode.text"
        :main-menu-bar="false"
        :navigation-bar="false"
        :status-bar="false"
        :read-only="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import JsonEditorVue from 'json-editor-vue';
import { Mode } from 'vanilla-jsoneditor';

interface Props {
  data: Record<string, any> | null;
}

defineProps<Props>();
</script>

<style scoped>
.schema-json-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
  font-style: italic;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.json-container {
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.json-viewer {
  height: 100%;
}
</style>
