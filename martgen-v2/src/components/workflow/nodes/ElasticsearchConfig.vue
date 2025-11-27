<template>
	<a-form layout="vertical">
		<a-form-item label="Credentials to connect with">
			<a-select v-model:value="formData.credentials" placeholder="Select credentials">
				<a-select-option value="elasticsearch-account">Elasticsearch Account</a-select-option>
				<a-select-option value="create-new">+ Create New Credential</a-select-option>
			</a-select>
		</a-form-item>

		<a-form-item label="Operation">
			<a-select v-model:value="formData.operation" placeholder="Select operation">
				<a-select-option value="search">Search</a-select-option>
				<a-select-option value="index">Index Document</a-select-option>
				<a-select-option value="update">Update Document</a-select-option>
				<a-select-option value="delete">Delete Document</a-select-option>
			</a-select>
		</a-form-item>

		<a-form-item v-if="formData.operation === 'search'" label="Query (JSON)">
			<ExpressionInput
				v-model:modelValue="formData.query"
				placeholder='{"query": {"match_all": {}}}'
				type="textarea"
				:rows="8"
			/>
			<p class="form-help-text">Enter Elasticsearch query in JSON format</p>
		</a-form-item>

		<a-form-item label="Index">
			<ExpressionInput v-model:modelValue="formData.index" placeholder="Enter index name" />
		</a-form-item>
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
	operation: props.modelValue?.operation || 'search',
	query: props.modelValue?.query || '',
	index: props.modelValue?.index || '',
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
</style>
