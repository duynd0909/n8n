import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#FF8A3D',
    colorPrimaryHover: '#E67428',
    colorPrimaryActive: '#D66820',
    colorPrimaryBg: '#FFF7ED',
    colorPrimaryBgHover: '#FFEDD5',
    colorSuccess: '#2EAD5F',
    colorWarning: '#F59E0B',
    colorError: '#E54848',
    colorInfo: '#3B82F6',
    colorText: '#111827',
    colorTextSecondary: '#6B7280',
    colorBorder: '#E5E7EB',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#F3F4F6',
    borderRadius: 8,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  components: {
    Menu: {
      itemSelectedBg: '#FFF7ED',
      itemSelectedColor: '#FF8A3D',
    },
    Button: {
      primaryShadow: '0 4px 12px rgba(255, 138, 61, 0.3)',
    },
    Table: {
      headerBg: '#F9FAFB',
      rowHoverBg: '#FFF7ED',
    },
    Input: {
      activeBorderColor: '#FF8A3D',
      hoverBorderColor: '#FFBD8A',
    },
  },
};
