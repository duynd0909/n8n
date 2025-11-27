import { globalIgnores } from 'eslint/config';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
import pluginVitest from '@vitest/eslint-plugin';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
	{
		name: 'app/files-to-lint',
		files: ['**/*.{ts,mts,tsx,vue}'],
	},

	globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

	pluginVue.configs['flat/essential'],
	vueTsConfigs.recommended,

	{
		...pluginVitest.configs.recommended,
		files: ['src/**/__tests__/*'],
	},
	skipFormatting,
	// Custom rules for Vue, TypeScript, and general JavaScript
	{
		name: 'app/custom-rules',
		rules: {
			// General JavaScript/TypeScript rules
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			], // Allow unused variables prefixed with '_'
			'@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }], // Require explicit return types for functions, but allow flexibility for expressions
			'@typescript-eslint/no-explicit-any': 'error', // Disallow use of 'any' type
			'prefer-const': 'error', // Enforce const for variables that are never reassigned

			// Vue-specific rules
			'vue/multi-word-component-names': ['warn'], // Require multi-word component names, except for specific exceptions
			'vue/no-unused-components': 'error', // Disallow unused Vue components
			'vue/prop-name-casing': ['error', 'camelCase'], // Enforce camelCase for prop names
			'vue/require-default-prop': 'warn', // Warn if props are missing default values
			'vue/no-v-html': 'error', // Disallow use of v-html to prevent XSS risks
			'vue/html-self-closing': [
				'error',
				{
					html: { void: 'always', normal: 'always', component: 'always' },
					svg: 'always',
					math: 'always',
				},
			], // Enforce self-closing tags for consistency

			// Accessibility rules (for Ant Design Vue components)
			'vue/no-deprecated-slot-attribute': 'error', // Disallow deprecated slot attributes
			'vue/no-reserved-component-names': 'error', // Prevent using reserved HTML/JS names for components
			'vue/attributes-order': [
				'error',
				{
					order: [
						'DEFINITION',
						'LIST_RENDERING',
						'CONDITIONALS',
						'RENDER_MODIFIERS',
						'GLOBAL',
						['UNIQUE', 'SLOT'],
						'TWO_WAY_BINDING',
						'OTHER_DIRECTIVES',
						'OTHER_ATTR',
						'EVENTS',
						'CONTENT',
					],
					alphabetical: false,
				},
			],
		},
	},
);
