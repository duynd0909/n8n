<template>
	<div class="schema-header">
		<div class="header-top">
			<div class="title-section">
				<h4>{{ title }}</h4>
				<span v-if="status === 'success'" class="status-icon success">✓</span>
				<span v-else-if="status === 'error'" class="status-icon error">✗</span>
				<span v-else-if="status === 'running'" class="status-icon running">⟳</span>
			</div>

			<div class="controls">
				<SearchOutlined class="control-icon" />
				<EditOutlined v-if="showEdit" class="control-icon" @click="emit('edit-mock')" />
				<MoreOutlined class="control-icon" />
			</div>
		</div>

		<a-tabs v-model:activeKey="activeView" size="small" @change="handleTabChange">
			<a-tab-pane key="schema" tab="Schema" />
			<a-tab-pane key="table" tab="Table" />
			<a-tab-pane key="json" tab="JSON" />
		</a-tabs>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { SearchOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons-vue';
import type { ViewMode, ExecutionStatus } from './types';

interface Props {
	title: 'INPUT' | 'OUTPUT';
	status?: ExecutionStatus;
	defaultView?: ViewMode;
	showEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	status: 'idle',
	defaultView: 'schema',
	showEdit: false,
});

const emit = defineEmits<{
	'view-change': [view: ViewMode];
	'edit-mock': [];
}>();

const activeView = ref<ViewMode>(props.defaultView);

watch(
	() => props.defaultView,
	(newView) => {
		activeView.value = newView;
	},
);

function handleTabChange(key: string) {
	activeView.value = key as ViewMode;
	emit('view-change', activeView.value);
}
</script>

<style scoped lang="scss">
.schema-header {
	padding: 12px 16px;
	border-bottom: 1px solid #e8e8e8;
	background: #fff;
}

.header-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.title-section {
	display: flex;
	align-items: center;
	gap: 8px;

	h4 {
		font-size: 12px;
		font-weight: 600;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0;
	}
}

.status-icon {
	font-size: 14px;

	&.success {
		color: #52c41a;
	}

	&.error {
		color: #ff4d4f;
	}

	&.running {
		color: #1890ff;
		animation: spin 1s linear infinite;
	}
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.controls {
	display: flex;
	gap: 12px;
}

.control-icon {
	font-size: 14px;
	color: #999;
	cursor: pointer;
	transition: color 0.2s;

	&:hover {
		color: #1890ff;
	}
}

:deep(.ant-tabs) {
	.ant-tabs-nav {
		margin: 0;
	}

	.ant-tabs-tab {
		padding: 6px 12px;
		font-size: 13px;
	}
}
</style>
