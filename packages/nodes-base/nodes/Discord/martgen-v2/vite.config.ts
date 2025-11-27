import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import vueDevtools from 'vite-plugin-vue-devtools';
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue(), vueDevtools()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use "@/styles/_variables.scss" as *; @use "@/styles/_mixins.scss" as *;`,
			},
		},
	},
});
