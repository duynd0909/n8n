<template>
	<div class="top-bar">
		<div class="top-bar-left">
			<div class="logo">
				<span class="logo-text">MARTGEN</span>
			</div>
			<a-breadcrumb :separator="'/'">
				<a-breadcrumb-item>Workflows</a-breadcrumb-item>
				<a-breadcrumb-item>
					<input v-model="workflowName" class="workflow-name-input" @blur="saveWorkflowName" />
				</a-breadcrumb-item>
			</a-breadcrumb>
		</div>

		<div class="top-bar-center">
			<a-segmented v-model:value="activeTab" :options="tabOptions" />
		</div>

		<div class="top-bar-right">
			<a-space :size="12">
				<a-switch
					v-model:checked="isActive"
					checked-children="Active"
					un-checked-children="Inactive"
				/>

				<a-button type="primary" :icon="h(SaveOutlined)" @click="handleSave"> Save </a-button>

				<a-dropdown>
					<a-avatar class="user-avatar" :size="32">
						<template #icon>
							<UserOutlined />
						</template>
					</a-avatar>
					<template #overlay>
						<a-menu>
							<a-menu-item key="profile"> <UserOutlined /> Profile </a-menu-item>
							<a-menu-item key="settings"> <SettingOutlined /> Settings </a-menu-item>
							<a-menu-divider />
							<a-menu-item key="logout"> <LogoutOutlined /> Logout </a-menu-item>
						</a-menu>
					</template>
				</a-dropdown>
			</a-space>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, h } from 'vue';
import { useWorkflowStore } from '@/stores/workflowStore';
import { SaveOutlined, SettingOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const workflowStore = useWorkflowStore();

const emit = defineEmits<{
	(e: 'tabChange', tab: string): void;
}>();

const workflowName = ref('My First Workflow');
const isActive = ref(false);
const activeTab = ref('Editor');

const tabOptions = [
	{ label: 'Editor', value: 'Editor' },
	{ label: 'Executions', value: 'Executions' },
];

watch(activeTab, (newTab) => {
	emit('tabChange', newTab);
});

watch(
	() => workflowStore.currentWorkflow,
	(workflow) => {
		if (workflow) {
			workflowName.value = workflow.name;
			isActive.value = workflow.active;
		}
	},
	{ immediate: true },
);

function saveWorkflowName() {
	if (workflowStore.currentWorkflow) {
		workflowStore.currentWorkflow.name = workflowName.value;
	}
}

function handleSave() {
	message.success('Workflow saved successfully');
}
</script>

<style scoped lang="scss">
.top-bar {
	height: $topbar-height;
	background: $color-bg;
	border-bottom: 1px solid $color-border;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 $spacing-lg;
	box-shadow: $shadow-sm;
	z-index: $z-sticky;
}

.top-bar-left,
.top-bar-center,
.top-bar-right {
	flex: 1;
	display: flex;
	align-items: center;
}

.top-bar-left {
	gap: $spacing-md;
}

.top-bar-center {
	justify-content: center;
}

.top-bar-right {
	justify-content: flex-end;
}

.logo {
	display: flex;
	align-items: center;

	.logo-text {
		font-size: $font-size-xl;
		font-weight: $font-weight-bold;
		color: $color-primary;
		letter-spacing: -0.5px;
	}
}

.workflow-name-input {
	font-size: $font-size-md;
	font-weight: $font-weight-medium;
	color: $color-text;
	border: none;
	background: transparent;
	padding: $spacing-2xs $spacing-xs;
	border-radius: $radius-sm;
	transition: all $transition-normal;
	min-width: 150px;

	&:hover {
		background: $color-bg-hover;
	}

	&:focus {
		outline: none;
		background: $color-primary-bg;
	}
}

.user-avatar {
	cursor: pointer;
	transition: all $transition-normal;

	&:hover {
		transform: scale(1.05);
	}
}
</style>
