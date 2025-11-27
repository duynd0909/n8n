<template>
	<a-form layout="vertical">
		<a-form-item label="Credentials to connect with">
			<a-select v-model:value="formData.credentials" placeholder="Select credentials">
				<a-select-option value="postgres-account">Postgres Account</a-select-option>
				<a-select-option value="create-new">+ Create New Credential</a-select-option>
			</a-select>
		</a-form-item>

		<a-form-item label="Operation">
			<a-select v-model:value="formData.operation" placeholder="Select operation">
				<a-select-option value="select">Select</a-select-option>
				<a-select-option value="insert">Insert</a-select-option>
				<a-select-option value="update">Update</a-select-option>
				<a-select-option value="delete">Delete</a-select-option>
				<a-select-option value="execute">Execute Query</a-select-option>
			</a-select>
		</a-form-item>

		<a-form-item v-if="formData.operation === 'execute'" label="Query">
			<ExpressionInput
				v-model:modelValue="formData.query"
				placeholder="Enter your SQL query..."
				type="textarea"
				:rows="6"
			/>
			<p class="form-help-text">Consider using query parameters to prevent SQL injection attacks</p>
		</a-form-item>

		<a-collapse ghost>
			<a-collapse-panel key="options" header="Options">
				<p class="placeholder-text">No properties</p>
				<a-button type="dashed" block>Add option</a-button>
			</a-collapse-panel>
		</a-collapse>
	</a-form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import ExpressionInput from '../ExpressionInput.vue';

interface Props {
	modelValue: any;
}

interface Emits {
	(e: 'update:modelValue', value: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formData = reactive({
	credentials: props.modelValue?.credentials || '',
	operation: props.modelValue?.operation || 'execute',
	query: props.modelValue?.query || '',
});

watch(formData, (newValue) => {
	emit('update:modelValue', { ...newValue });
});
</script>

<style scoped lang="scss">
.form-help-text {
	font-size: $font-size-xs;
	color: $color-text-secondary;
	margin-top: $spacing-2xs;
}

.placeholder-text {
	color: $color-text-secondary;
	font-size: $font-size-sm;
	margin: 0;
}
</style>
