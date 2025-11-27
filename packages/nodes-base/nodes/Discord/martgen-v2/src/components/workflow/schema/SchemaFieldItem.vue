<template>
	<div
		class="schema-field-item"
		:draggable="draggable"
		:class="{ 'is-dragging': isDragging, 'not-draggable': !draggable }"
		@dragstart="handleDragStart"
		@dragend="handleDragEnd"
	>
		<!-- Type Badge -->
		<div class="type-badge" :class="`type-${valueType}`">
			<span v-if="valueType === 'string'">T</span>
			<span v-else-if="valueType === 'number'">#</span>
			<span v-else-if="valueType === 'boolean'" class="bool-icon">◉</span>
			<span v-else-if="valueType === 'object'">{ }</span>
			<span v-else-if="valueType === 'array'">[ ]</span>
			<span v-else>?</span>
		</div>

		<!-- Field Name Badge -->
		<div class="field-name-badge">
			{{ fieldName }}
		</div>

		<!-- Value -->
		<div class="field-value" :class="`type-${valueType}`">
			{{ formattedValue }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { DragData, DataType } from './types';

interface Props {
	fieldName: string;
	fieldValue: any;
	fieldPath: string;
	nodeId: string;
	draggable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	draggable: true,
});

const emit = defineEmits<{
	'drag-start': [data: DragData];
	'drag-end': [];
}>();

const isDragging = ref(false);

const valueType = computed<DataType>(() => {
	if (props.fieldValue === null) return 'null';
	if (props.fieldValue === undefined) return 'undefined';
	if (Array.isArray(props.fieldValue)) return 'array';
	return typeof props.fieldValue as DataType;
});

const formattedValue = computed(() => {
	const val = props.fieldValue;

	if (val === null) return 'null';
	if (val === undefined) return 'undefined';
	if (typeof val === 'object') {
		// For objects/arrays, we don't show value in the row, just the type badge handles it
		// But if it's empty, maybe show something?
		// The requirement says: "Parent shows object icon with name badge only (no value)"
		return '';
	}
	if (typeof val === 'string') {
		// Show full string or truncated? Requirement: "Strings shown directly"
		if (val.length > 50) return val.substring(0, 50) + '...';
		return val;
	}

	return String(val);
});

function handleDragStart(event: DragEvent) {
	isDragging.value = true;

	const dragData: DragData = {
		fieldPath: props.fieldPath,
		fieldName: props.fieldName,
		fieldValue: props.fieldValue,
		valueType: valueType.value,
		expression: `{{$input.${props.fieldPath}}}`,
		sourceNodeId: props.nodeId,
	};

	// Set data transfer
	event.dataTransfer!.effectAllowed = 'copy';
	event.dataTransfer!.setData('application/json', JSON.stringify(dragData));
	event.dataTransfer!.setData('text/plain', dragData.expression);

	// Store globally for drop targets
	(window as any).__schemaDragData = dragData;

	emit('drag-start', dragData);
}

function handleDragEnd() {
	isDragging.value = false;
	emit('drag-end');
}
</script>

<style scoped lang="scss">
.schema-field-item {
	display: flex;
	align-items: center;
	padding: 4px 8px;
	cursor: grab;
	transition: background-color 0.2s;
	border-radius: 4px;
	height: 32px;
	gap: 8px;

	&:hover {
		background-color: #f0f0f0;
	}

	&.is-dragging {
		opacity: 0.5;
		cursor: grabbing;
	}

	&.not-draggable {
		cursor: default;

		&:hover {
			background-color: transparent;
		}
	}

	&:active:not(.not-draggable) {
		cursor: grabbing;
	}
}

.type-badge {
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 4px;
	font-size: 11px;
	font-weight: 600;
	flex-shrink: 0;
	border: 1px solid transparent;

	&.type-string {
		background-color: #e6fffa;
		color: #006d75;
		border-color: #b5f5ec;
	}

	&.type-number {
		background-color: #e6f7ff;
		color: #096dd9;
		border-color: #bae7ff;
	}

	&.type-boolean {
		background-color: #fff0f6;
		color: #c41d7f;
		border-color: #ffd6e7;

		.bool-icon {
			font-size: 14px;
			line-height: 1;
		}
	}

	&.type-object {
		background-color: #fff7e6;
		color: #d46b08;
		border-color: #ffe7ba;
	}

	&.type-array {
		background-color: #fff7e6;
		color: #d46b08;
		border-color: #ffe7ba;
	}

	&.type-null,
	&.type-undefined {
		background-color: #f5f5f5;
		color: #999;
		border-color: #d9d9d9;
	}
}

.field-name-badge {
	background-color: #fff;
	border: 1px solid #d9d9d9;
	border-radius: 4px;
	padding: 0 8px;
	font-size: 12px;
	font-weight: 500;
	color: #333;
	height: 22px;
	line-height: 20px;
	white-space: nowrap;
}

.field-value {
	color: #666;
	font-size: 12px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex: 1;

	&.type-string {
		color: #222;
	}

	&.type-number {
		color: #096dd9;
	}

	&.type-boolean {
		color: #c41d7f;
	}

	&.type-null,
	&.type-undefined {
		color: #999;
		font-style: italic;
	}
}
</style>
