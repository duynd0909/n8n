<template>
	<a-form layout="vertical">
		<a-form-item label="Mode">
			<a-select v-model:value="formData.mode" placeholder="Select execution mode">
				<a-select-option value="runOnceForAllItems"> Run Once for All Items </a-select-option>
				<a-select-option value="runOnceForEachItem"> Run Once for Each Item </a-select-option>
			</a-select>
			<p class="form-help-text">Determines how the code is executed for input items</p>
		</a-form-item>

		<a-form-item label="JavaScript">
			<div ref="editorContainer" class="code-editor-container" />
			<div class="editor-help">
				<p class="help-title">
					Type <strong>$</strong> for a list of <strong>special vars/methods</strong>.
				</p>
				<p class="help-text">
					Debug by using <code>console.log()</code> statements and viewing their output in the
					browser console.
				</p>
			</div>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

interface Props {
	modelValue: any;
}

interface Emits {
	(e: 'update:modelValue', value: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const editorContainer = ref<HTMLElement>();
let editorView: EditorView | null = null;

const defaultCode = `// Loop over input items and add a new field called 'myNewField' to the JSON of each one
for (const item of $input.all()) {
  item.json.myNewField = 1;
}

return $input.all();`;

const formData = reactive({
	mode: props.modelValue?.mode || 'runOnceForAllItems',
	language: props.modelValue?.language || 'javascript',
	code: props.modelValue?.code || defaultCode,
});

watch(
	formData,
	(newValue) => {
		emit('update:modelValue', { ...newValue });
	},
	{ deep: true },
);

onMounted(() => {
	if (editorContainer.value) {
		editorView = new EditorView({
			doc: formData.code,
			extensions: [
				basicSetup,
				javascript(),
				oneDark,
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						formData.code = update.state.doc.toString();
					}
				}),
			],
			parent: editorContainer.value,
		});
	}
});

onBeforeUnmount(() => {
	if (editorView) {
		editorView.destroy();
	}
});
</script>

<style scoped lang="scss">
.form-help-text {
	font-size: $font-size-xs;
	color: $color-text-secondary;
	margin-top: $spacing-2xs;
}

.code-editor-container {
	border: 1px solid $color-border;
	border-radius: 4px;
	overflow: hidden;
	min-height: 300px;
	font-family: 'Consolas', 'Monaco', 'Courier New', monospace;

	:deep(.cm-editor) {
		height: 100%;
	}

	:deep(.cm-scroller) {
		min-height: 300px;
	}
}

.editor-help {
	margin-top: $spacing-sm;
	padding: $spacing-sm;
	background-color: #fff7e6;
	border: 1px solid #ffe7ba;
	border-radius: 4px;

	.help-title {
		font-size: $font-size-sm;
		color: #333;
		margin: 0 0 $spacing-2xs 0;

		strong {
			color: #d46b08;
		}
	}

	.help-text {
		font-size: $font-size-xs;
		color: $color-text-secondary;
		margin: 0;

		code {
			background-color: #f5f5f5;
			padding: 2px 6px;
			border-radius: 2px;
			font-family: 'Consolas', 'Monaco', monospace;
			font-size: $font-size-xs;
		}
	}
}
</style>
