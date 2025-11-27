<template>
	<div class="schema-table-view">
		<div v-if="!data || tableData.length === 0" class="empty-state">
			<p>No data available</p>
		</div>

		<div v-else class="table-container">
			<table class="data-table">
				<thead>
					<tr>
						<th>Field</th>
						<th>Value</th>
						<th>Type</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in tableData" :key="row.field">
						<td class="field-cell">{{ row.field }}</td>
						<td class="value-cell">{{ row.value }}</td>
						<td class="type-cell">{{ row.type }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
	data: Record<string, any> | null;
}

const props = defineProps<Props>();

const tableData = computed(() => {
	if (!props.data) return [];

	const rows: Array<{ field: string; value: string; type: string }> = [];

	// Flatten one level
	for (const [key, value] of Object.entries(props.data)) {
		if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
			// Flatten nested objects by one level
			for (const [nestedKey, nestedValue] of Object.entries(value)) {
				rows.push({
					field: `${key}.${nestedKey}`,
					value: formatValue(nestedValue),
					type: getType(nestedValue),
				});
			}
		} else {
			rows.push({
				field: key,
				value: formatValue(value),
				type: getType(value),
			});
		}
	}

	return rows;
});

function formatValue(value: any): string {
	if (value === null) return 'null';
	if (value === undefined) return 'undefined';
	if (typeof value === 'object') {
		// Show actual content for arrays and objects with pretty formatting
		try {
			const stringified = JSON.stringify(value, null, 2);
			// Limit length for display
			if (stringified.length > 1000) {
				return stringified.substring(0, 1000) + '...';
			}
			return stringified;
		} catch (e) {
			return '[Complex Object]';
		}
	}
	if (typeof value === 'string' && value.length > 500) {
		return value.substring(0, 500) + '...';
	}
	return String(value);
}

function getType(value: any): string {
	if (value === null) return 'null';
	if (value === undefined) return 'undefined';
	if (Array.isArray(value)) return 'array';
	return typeof value;
}
</script>

<style scoped lang="scss">
.schema-table-view {
	width: 100%;
	height: 100%;
	overflow-y: auto;
	padding: 12px;
}

.empty-state {
	text-align: center;
	padding: 40px 20px;
	color: #999;

	p {
		margin: 0;
		font-size: 14px;
	}
}

.table-container {
	width: 100%;
	overflow-x: auto;
}

.data-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 13px;

	th {
		background-color: #f5f5f5;
		padding: 10px 12px;
		text-align: left;
		font-weight: 600;
		color: #333;
		border-bottom: 2px solid #e0e0e0;
		position: sticky;
		top: 0;
	}

	td {
		padding: 8px 12px;
		border-bottom: 1px solid #f0f0f0;
	}

	tr:hover {
		background-color: #fafafa;
	}
}

.field-cell {
	font-weight: 500;
	color: #333;
}

.value-cell {
	color: #666;
	font-family: 'Consolas', 'Monaco', monospace;
	max-width: 600px;
	white-space: pre-wrap;
	word-break: break-word;
}

.type-cell {
	color: #999;
	font-size: 12px;
	text-transform: uppercase;
}
</style>
