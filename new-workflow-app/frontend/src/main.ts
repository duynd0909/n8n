import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'

// Import Vue Flow CSS
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';

const app = createApp(App)
app.use(Antd)
app.mount('#app')
