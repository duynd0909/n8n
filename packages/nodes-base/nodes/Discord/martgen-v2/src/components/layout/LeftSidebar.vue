<template>
	<div :class="['left-sidebar', { collapsed }]">
		<div class="sidebar-content">
			<a-menu
				v-if="!collapsed"
				mode="inline"
				:selectedKeys="selectedKeys"
				style="border-right: none"
			>
				<a-menu-item key="workflows">
					<template #icon><FolderOutlined /></template>
					<span>Workflows</span>
				</a-menu-item>

				<a-sub-menu key="projects">
					<template #icon><ProjectOutlined /></template>
					<template #title>Personal Projects</template>
					<a-menu-item key="project-1"> <FileTextOutlined /> Data Sync Workflow </a-menu-item>
					<a-menu-item key="project-2"> <FileTextOutlined /> ES to PostgreSQL </a-menu-item>
					<a-menu-item key="project-3"> <FileTextOutlined /> Data Transform </a-menu-item>
				</a-sub-menu>

				<a-menu-item key="credentials">
					<template #icon><KeyOutlined /></template>
					<span>Credentials</span>
				</a-menu-item>

				<a-menu-item key="executions">
					<template #icon><ClockCircleOutlined /></template>
					<span>Executions</span>
				</a-menu-item>

				<a-menu-divider />

				<a-menu-item key="settings">
					<template #icon><SettingOutlined /></template>
					<span>Settings</span>
				</a-menu-item>
			</a-menu>

			<div v-else class="sidebar-icons">
				<a-tooltip placement="right" title="Workflows">
					<div class="sidebar-icon" :class="{ active: selectedKeys.includes('workflows') }">
						<FolderOutlined />
					</div>
				</a-tooltip>

				<a-tooltip placement="right" title="Personal Projects">
					<div class="sidebar-icon">
						<ProjectOutlined />
					</div>
				</a-tooltip>

				<a-tooltip placement="right" title="Credentials">
					<div class="sidebar-icon">
						<KeyOutlined />
					</div>
				</a-tooltip>

				<a-tooltip placement="right" title="Executions">
					<div class="sidebar-icon">
						<ClockCircleOutlined />
					</div>
				</a-tooltip>

				<div class="sidebar-divider" />

				<a-tooltip placement="right" title="Settings">
					<div class="sidebar-icon">
						<SettingOutlined />
					</div>
				</a-tooltip>
			</div>
		</div>

		<div class="sidebar-toggle" @click="collapsed = !collapsed">
			<MenuFoldOutlined v-if="!collapsed" />
			<MenuUnfoldOutlined v-else />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	FolderOutlined,
	ProjectOutlined,
	FileTextOutlined,
	KeyOutlined,
	ClockCircleOutlined,
	SettingOutlined,
} from '@ant-design/icons-vue';

const collapsed = ref(false);
const selectedKeys = ref(['project-2']);
</script>

<style scoped lang="scss">
.left-sidebar {
	width: $sidebar-width;
	background: $color-bg;
	border-right: 1px solid $color-border;
	display: flex;
	flex-direction: column;
	transition: width $transition-normal;
	position: relative;

	&.collapsed {
		width: $sidebar-collapsed-width;
	}
}

.sidebar-content {
	flex: 1;
	overflow-y: auto;
	padding: $spacing-xs 0;
}

.sidebar-icons {
	display: flex;
	flex-direction: column;
	gap: $spacing-xs;
	padding: $spacing-xs;

	.sidebar-icon {
		width: $sidebar-collapsed-width - ($spacing-xs * 2);
		height: 48px;
		@include flex-center;
		font-size: $font-size-xl;
		color: $color-text-secondary;
		border-radius: $radius-md;
		cursor: pointer;
		transition: all $transition-normal;

		&:hover {
			background: $color-bg-hover;
			color: $color-primary;
		}

		&.active {
			background: $color-primary-bg;
			color: $color-primary;
		}
	}

	.sidebar-divider {
		height: 1px;
		background: $color-border-light;
		margin: $spacing-xs 0;
	}
}

.sidebar-toggle {
	height: 40px;
	@include flex-center;
	cursor: pointer;
	color: $color-text-secondary;
	transition: all $transition-normal;
	border-top: 1px solid $color-border-light;
	margin-top: auto;

	&:hover {
		background: $color-bg-hover;
		color: $color-primary;
	}
}

@include tablet {
	.left-sidebar {
		&:not(.collapsed) {
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			z-index: $z-dropdown;
			box-shadow: $shadow-lg;
		}
	}
}
</style>
