<template>
	<div class="schema-viewer">
		<!-- Edit mode header -->
		<div v-if="isEditMode" class="edit-header">
			<h4>EDIT OUTPUT</h4>
			<div class="edit-actions">
				<a-button @click="handleCancelEdit">Cancel</a-button>
				<a-button type="primary" danger :disabled="!isJsonValid" @click="handleSaveEdit">
					Save
				</a-button>
			</div>
		</div>

		<!-- Normal header -->
		<SchemaHeader
			v-else
			:title="title"
			:status="status"
			:default-view="currentView"
			:show-edit="editable"
			@view-change="handleViewChange"
			@edit-mock="handleEditMock"
		/>

		<div class="schema-content">
			<!-- Edit mode: JSON editor -->
			<div v-if="isEditMode" class="json-editor-wrapper">
				<JsonEditorVue
					v-model="mockDataJson"
					class="json-editor"
					:mode="Mode.text"
					:main-menu-bar="false"
					:navigation-bar="false"
					:status-bar="false"
					:ask-to-format="false"
					:stringified="false"
					:onChange="handleJsonChange"
				/>
			</div>

			<!-- Normal mode: data views -->
			<template v-else>
				<div v-if="!data" class="placeholder">
					<p class="placeholder-text">
						{{
							title === 'INPUT'
								? 'Execute previous node to view input data'
								: 'Execute this node to view data'
						}}
					</p>
					<a-button v-if="editable" type="link" @click="handleEditMock">
						or set mock data
					</a-button>
				</div>

				<template v-else>
					<SchemaTreeView
						v-if="currentView === 'schema'"
						:data="data"
						:node-id="nodeId"
						:draggable="draggable"
						@field-drag="emit('field-drag', $event)"
					/>

					<SchemaTableView v-else-if="currentView === 'table'" :data="data" />

					<SchemaJsonView v-else-if="currentView === 'json'" :data="data" />
				</template>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import JsonEditorVue from 'json-editor-vue';
import SchemaHeader from './SchemaHeader.vue';
import SchemaTreeView from './SchemaTreeView.vue';
import SchemaTableView from './SchemaTableView.vue';
import SchemaJsonView from './SchemaJsonView.vue';
import type { ViewMode, ExecutionStatus, DragData } from './types';
import { Mode } from 'vanilla-jsoneditor';

interface Props {
	title: 'INPUT' | 'OUTPUT';
	nodeId: string;
	data: Record<string, any> | null;
	status?: ExecutionStatus;
	defaultView?: ViewMode;
	searchable?: boolean;
	editable?: boolean;
	draggable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	status: 'idle',
	defaultView: 'schema',
	searchable: true,
	editable: false,
	draggable: true,
});

const emit = defineEmits<{
	'view-change': [view: ViewMode];
	'field-drag': [data: DragData];
	'mock-data-save': [data: Record<string, any>];
}>();

const currentView = ref<ViewMode>(props.defaultView);
const isEditMode = ref(false);
const mockDataJson = ref<any>({});
watch(
	() => props.defaultView,
	(newView) => {
		currentView.value = newView;
	},
);

function handleViewChange(view: ViewMode) {
	currentView.value = view;
	emit('view-change', view);
}

function handleEditMock() {
	// Enter edit mode
	isEditMode.value = true;
	mockDataJson.value = JSON.parse(JSON.stringify(props.data || {}));
	isJsonValid.value = true;
}

function handleCancelEdit() {
	// Exit edit mode
	isEditMode.value = false;
	mockDataJson.value = {};
}

function handleSaveEdit() {
	// json-editor-vue v-model returns the parsed object directly
	emit('mock-data-save', mockDataJson.value);
	isEditMode.value = false;
	mockDataJson.value = {};
}

const isJsonValid = ref(true);

const handleJsonChange = (content: any, previousContent?: any, status?: any) => {
	const errors = status?.contentErrors;
	if (errors?.parseError) {
		isJsonValid.value = false;
		return;
	}
	if (errors?.validationErrors?.length > 0) {
		isJsonValid.value = false;
		return;
	}
	isJsonValid.value = true;
};
</script>

<style scoped lang="scss">
.schema-viewer {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: #fafafa;
}

.edit-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px 20px;
	background: #fff;
	border-bottom: 1px solid #e8e8e8;

	h4 {
		font-size: 13px;
		font-weight: 600;
		color: #333;
		margin: 0;
		letter-spacing: 0.5px;
	}

	.edit-actions {
		display: flex;
		gap: 8px;
	}
}

.schema-content {
	flex: 1;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
}

.json-editor-wrapper {
	flex: 1;
	overflow: hidden;
}

.json-editor {
	height: 100%;
}

.placeholder {
	text-align: center;
	padding: 60px 20px;
}

.placeholder-text {
	color: #999;
	font-size: 13px;
	margin: 0 0 8px 0;
}

.error-text {
	color: #ff4d4f;
	font-size: 13px;
	align-self: center;
}
</style>
