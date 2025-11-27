<template>
	<div class="expression-input">
		<!-- Expression Mode -->
		<div v-if="isExpression" class="expression-editor-wrapper" :class="{ focused: isFocused }">
			<div ref="editorContainer" class="code-editor-container" />
			<div class="expression-indicator">Expression</div>
		</div>

		<!-- Simple Input Mode -->
		<a-textarea
			v-else-if="type === 'textarea'"
			:value="modelValue"
			:placeholder="placeholder"
			:rows="rows"
			@update:value="handleInputChange"
			@focus="isFocused = true"
			@blur="isFocused = false"
		/>
		<a-input
			v-else
			:value="modelValue"
			:placeholder="placeholder"
			@update:value="handleInputChange"
			@focus="isFocused = true"
			@blur="isFocused = false"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';

interface Props {
	modelValue: string;
	placeholder?: string;
	type?: 'input' | 'textarea';
	rows?: number;
}

interface Emits {
	(e: 'update:modelValue', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
	type: 'input',
	rows: 4,
	placeholder: '',
});
const emit = defineEmits<Emits>();

const editorContainer = ref<HTMLElement>();
let editorView: EditorView | null = null;
const isFocused = ref(false);

const isExpression = ref(false);

// Initialize based on initial value
if (props.modelValue && props.modelValue.startsWith('=')) {
	isExpression.value = true;
}

onMounted(() => {
	if (isExpression.value) {
		initEditor();
	}
});

// Watch for external changes
watch(
	() => props.modelValue,
	(newValue) => {
		if (newValue && newValue.startsWith('=')) {
			if (!isExpression.value) {
				isExpression.value = true;
				nextTick(() => initEditor());
			} else if (editorView && editorView.state.doc.toString() !== newValue) {
				// Update editor content if it changed externally
				editorView.dispatch({
					changes: {
						from: 0,
						to: editorView.state.doc.length,
						insert: newValue,
					},
				});
			}
		} else {
			if (isExpression.value) {
				// If value no longer starts with =, switch back to simple input
				isExpression.value = false;
				destroyEditor();
			}
		}
	},
);

function handleInputChange(value: string) {
	emit('update:modelValue', value);
	if (value.startsWith('=')) {
		isExpression.value = true;
		nextTick(() => initEditor());
	}
}

function initEditor() {
	if (!editorContainer.value) return;

	// Destroy existing if any
	destroyEditor();

	editorView = new EditorView({
		doc: props.modelValue,
		extensions: [
			basicSetup,
			javascript(),
			EditorView.theme({
				'&': {
					height: 'auto',
					minHeight: '32px',
					fontSize: '14px',
				},
				'.cm-scroller': {
					overflow: 'hidden',
					fontFamily: 'Consolas, Monaco, monospace',
				},
				'.cm-content': {
					padding: '4px 8px',
				},
				'&.cm-focused': {
					outline: 'none',
				},
			}),
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					const newValue = update.state.doc.toString();
					emit('update:modelValue', newValue);

					if (!newValue.startsWith('=')) {
						if (newValue === '') {
							isExpression.value = false;
							destroyEditor();
						}
					}
				}
				if (update.focusChanged) {
					isFocused.value = update.view.hasFocus;
				}
			}),
		],
		parent: editorContainer.value,
	});
}

function destroyEditor() {
	if (editorView) {
		editorView.destroy();
		editorView = null;
	}
}

onBeforeUnmount(() => {
	destroyEditor();
});
</script>

<style scoped lang="scss">
.expression-input {
	width: 100%;
}

.expression-editor-wrapper {
	position: relative;
	border: 1px solid $color-border;
	border-radius: $radius-sm;
	background: #fff;
	transition: all 0.2s;

	&.focused {
		border-color: $color-primary;
		box-shadow: 0 0 0 2px rgba($color-primary, 0.2);
	}
}

.code-editor-container {
	min-height: 32px;
}

.expression-indicator {
	position: absolute;
	right: 8px;
	top: -10px;
	background: $color-primary;
	color: white;
	font-size: 10px;
	padding: 0 6px;
	border-radius: 4px;
	pointer-events: none;
	font-weight: 600;
}
</style>
