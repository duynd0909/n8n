import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';

export const themeConfig: ThemeConfig = {
  token: {
    // Primary colors
    colorPrimary: '#ff5b00',
    colorPrimaryHover: '#e65200',
    colorPrimaryActive: '#cc4a00',
    colorPrimaryBg: '#fff2eb',
    colorPrimaryBgHover: '#ffe4d6',

    // Success/Error/Warning
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',

    // Text
    colorText: '#262626',
    colorTextSecondary: '#8c8c8c',
    colorTextTertiary: '#bfbfbf',

    // Borders & Backgrounds
    colorBorder: '#d9d9d9',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',

    // Typography
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,

    // Border radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
  },
  components: {
    Button: {
      primaryColor: '#ffffff',
      colorPrimaryHover: '#e65200',
    },
    Menu: {
      itemSelectedBg: '#fff2eb',
      itemSelectedColor: '#ff5b00',
    },
    Table: {
      headerBg: '#fafafa',
      rowHoverBg: '#fff2eb',
    },
  },
};
