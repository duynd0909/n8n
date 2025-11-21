<template>
  <div class="empty-state">
    <!-- Add first step box (n8n style) -->
    <div class="add-step-box" @click="$emit('addTrigger')">
      <div class="add-icon">
        <PlusOutlined />
      </div>
    </div>
    <p class="add-text">Add first step...</p>
    <a class="template-link" @click="$emit('useTemplate')">
      or start from a template
    </a>
  </div>
</template>

<script setup lang="ts">
import { PlusOutlined } from '@ant-design/icons-vue';

defineEmits<{
  addTrigger: [];
  useTemplate: [];
}>();
</script>

<style lang="scss" scoped>
.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
  background-image: radial-gradient(circle, #E5E7EB 1px, transparent 1px);
  background-size: 20px 20px;
}

.add-step-box {
  width: 100px;
  height: 100px;
  border: 2px dashed #9CA3AF;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;

  &:hover {
    border-color: #FF8A3D;
    background: rgba(255, 138, 61, 0.05);

    .add-icon {
      color: #FF8A3D;
    }
  }
}

.add-icon {
  font-size: 32px;
  color: #9CA3AF;
  transition: color 0.2s;
}

.add-text {
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.template-link {
  margin-top: 8px;
  font-size: 13px;
  color: #FF8A3D;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #E67428;
    text-decoration: underline;
  }
}
</style>
