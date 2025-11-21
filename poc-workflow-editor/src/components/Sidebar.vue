<template>
  <div class="sidebar" :class="{ expanded: isExpanded }">
    <div class="sidebar-content">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">W</div>
        <span v-if="isExpanded" class="logo-text">Workflow</span>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <a-tooltip v-for="item in navItems" :key="item.key" :title="!isExpanded ? item.label : ''" placement="right">
          <div
            class="nav-item"
            :class="{ active: activeKey === item.key }"
            @click="handleNavClick(item.key)"
          >
            <component :is="item.icon" class="nav-icon" />
            <span v-if="isExpanded" class="nav-label">{{ item.label }}</span>
          </div>
        </a-tooltip>
      </nav>

      <!-- Bottom section -->
      <div class="sidebar-bottom">
        <a-tooltip :title="!isExpanded ? 'Toggle sidebar' : ''" placement="right">
          <div class="nav-item" @click="toggleSidebar">
            <MenuFoldOutlined v-if="isExpanded" class="nav-icon" />
            <MenuUnfoldOutlined v-else class="nav-icon" />
            <span v-if="isExpanded" class="nav-label">Collapse</span>
          </div>
        </a-tooltip>

        <a-dropdown :trigger="['click']" placement="topRight">
          <div class="user-avatar">
            <a-avatar :size="32" style="background-color: #FF8A3D">U</a-avatar>
            <span v-if="isExpanded" class="user-name">User</span>
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item key="profile">
                <UserOutlined /> Profile
              </a-menu-item>
              <a-menu-item key="settings">
                <SettingOutlined /> Settings
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="logout">
                <LogoutOutlined /> Logout
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  ApartmentOutlined,
  HistoryOutlined,
  KeyOutlined,
  CodeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue';

const isExpanded = ref(false);
const activeKey = ref('workflows');

const navItems = [
  { key: 'workflows', label: 'Workflows', icon: ApartmentOutlined },
  { key: 'executions', label: 'Executions', icon: HistoryOutlined },
  { key: 'credentials', label: 'Credentials', icon: KeyOutlined },
  { key: 'variables', label: 'Variables', icon: CodeOutlined },
];

function toggleSidebar() {
  isExpanded.value = !isExpanded.value;
}

function handleNavClick(key: string) {
  activeKey.value = key;
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: 72px;
  min-width: 72px;
  height: 100vh;
  background: #0F172A;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease, min-width 0.3s ease;
  flex-shrink: 0;

  &.expanded {
    width: 240px;
    min-width: 240px;
  }
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 12px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  margin-bottom: 24px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #FF8A3D 0%, #E67428 100%);
  color: #fff;
  font-weight: 700;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: #1E293B;
  }

  &.active {
    background: #334155;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background: #FF8A3D;
      border-radius: 0 4px 4px 0;
    }
  }
}

.nav-icon {
  font-size: 20px;
  color: #94A3B8;
  flex-shrink: 0;

  .nav-item.active & {
    color: #FF8A3D;
  }

  .nav-item:hover & {
    color: #fff;
  }
}

.nav-label {
  font-size: 14px;
  color: #CBD5E1;
  white-space: nowrap;

  .nav-item.active & {
    color: #fff;
  }
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #1E293B;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1E293B;
  }
}

.user-name {
  font-size: 14px;
  color: #CBD5E1;
}
</style>
