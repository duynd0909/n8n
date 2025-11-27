<template>
  <div class="loop-config">
    <a-form :model="formData" layout="vertical">
      <!-- Batch Size -->
      <a-form-item label="Batch Size" name="batchSize">
        <a-input-number
          v-model:value="formData.batchSize"
          :min="1"
          :max="10000"
          placeholder="Number of items per batch"
          style="width: 100%"
        />
        <div class="parameter-description">
          Number of items to process in each loop iteration
        </div>
      </a-form-item>

      <!-- Reset Option -->
      <a-form-item name="reset">
        <a-checkbox v-model:checked="formData.reset">
          Reset on new input
        </a-checkbox>
        <div class="parameter-description">
          When enabled, restarts from the beginning instead of continuing
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  modelValue: any;
}

interface Emits {
  (e: 'update:modelValue', value: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Form data with safe defaults
const formData = ref({
  batchSize: (props.modelValue?.batchSize as number) || 1,
  reset: (props.modelValue?.reset as boolean) || false,
});

// Watch for form changes and emit updates
watch(
  formData,
  (newValue) => {
    emit('update:modelValue', {
      batchSize: newValue.batchSize,
      reset: newValue.reset,
    });
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
.loop-config {
  padding: 0;
}

.parameter-description {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

.loop-status {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}
</style>
