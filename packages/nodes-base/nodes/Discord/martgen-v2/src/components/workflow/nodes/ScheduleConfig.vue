<template>
	<a-form layout="vertical">
		<a-form-item label="Trigger Interval">
			<a-select v-model:value="formData.scheduleInterval" placeholder="Select interval">
				<a-select-option value="seconds">Seconds</a-select-option>
				<a-select-option value="minutes">Minutes</a-select-option>
				<a-select-option value="hours">Hourly</a-select-option>
				<a-select-option value="days">Daily</a-select-option>
				<a-select-option value="weeks">Weekly</a-select-option>
				<a-select-option value="months">Monthly</a-select-option>
				<a-select-option value="years">Yearly</a-select-option>
			</a-select>
		</a-form-item>

		<!-- Seconds: Every X Seconds -->
		<template v-if="formData.scheduleInterval === 'seconds'">
			<a-form-item label="Every X Seconds">
				<a-input-number
					v-model:value="formData.everySeconds"
					:min="1"
					:max="59"
					placeholder="Enter seconds"
					style="width: 100%"
				/>
			</a-form-item>
		</template>

		<!-- Minutes: Every X Minutes -->
		<template v-if="formData.scheduleInterval === 'minutes'">
			<a-form-item label="Every X Minutes">
				<a-input-number
					v-model:value="formData.everyMinutes"
					:min="1"
					:max="59"
					placeholder="Enter minutes"
					style="width: 100%"
				/>
			</a-form-item>
		</template>

		<!-- Hourly: Every X Hours + At Minute -->
		<template v-if="formData.scheduleInterval === 'hours'">
			<a-form-item label="Every X Hours">
				<a-input-number
					v-model:value="formData.everyHours"
					:min="1"
					:max="23"
					placeholder="Enter hours"
					style="width: 100%"
				/>
			</a-form-item>
			<a-form-item label="At Minute">
				<a-input-number
					v-model:value="formData.minute"
					:min="0"
					:max="59"
					placeholder="0-59"
					style="width: 100%"
				/>
			</a-form-item>
		</template>

		<!-- Daily: Every X Days + At Hour + At Minute -->
		<template v-if="formData.scheduleInterval === 'days'">
			<a-form-item label="Every X Days">
				<a-input-number
					v-model:value="formData.everyDays"
					:min="1"
					:max="31"
					placeholder="Enter days"
					style="width: 100%"
				/>
			</a-form-item>
			<a-form-item label="At Hour">
				<a-input-number
					v-model:value="formData.hour"
					:min="0"
					:max="23"
					placeholder="0-23"
					style="width: 100%"
				/>
			</a-form-item>
			<a-form-item label="At Minute">
				<a-input-number
					v-model:value="formData.minute"
					:min="0"
					:max="59"
					placeholder="0-59"
					style="width: 100%"
				/>
			</a-form-item>
		</template>

		<!-- Weekly: Every X Weeks + Day of Week + At Hour + At Minute -->
		<template v-if="formData.scheduleInterval === 'weeks'">
			<a-form-item label="Every X Weeks">
				<a-input-number
					v-model:value="formData.everyWeeks"
					:min="1"
					:max="52"
					placeholder="Enter weeks"
					style="width: 100%"
				/>
			</a-form-item>
			<a-form-item label="Day of Week">
				<a-select v-model:value="formData.dayOfWeek" placeholder="Select day">
					<a-select-option value="0">Sunday</a-select-option>
					<a-select-option value="1">Monday</a-select-option>
					<a-select-option value="2">Tuesday</a-select-option>
					<a-select-option value="3">Wednesday</a-select-option>
					<a-select-option value="4">Thursday</a-select-option>
					<a-select-option value="5">Friday</a-select-option>
					<a-select-option value="6">Saturday</a-select-option>
				</a-select>
			</a-form-item>
			<a-form-item label="At Hour">
				<a-input-number
					v-model:value="formData.hour"
					:min="0"
					:max="23"
					placeholder="0-23"
					style="width: 100%"
				/>
			</a-form-item>
			<a-form-item label="At Minute">
				<a-input-number
					v-model:value="formData.minute"
					:min="0"
					:max="59"
					placeholder="0-59"
					style="width: 100%"
				/>
			</a-form-item>
		</template>

		<!-- Monthly: Every X Months + Day of Month + At Hour + At Minute -->
		<template v-if="formData.scheduleInterval === 'months'">
			<a-form-item label="Every X Months">
				<a-input-number
					v-model:value="formData.everyMonths"
					:min="1"
					:max="12"
					placeholder="Enter months"
					style="width: 100%"
				/>
			</a-form-item>
			<a-form-item label="Day of Month">
				<a-input-number
					v-model:value="formData.dayOfMonth"
					:min="1"
					:max="31"
					placeholder="1-31"
					style="width: 100%"
				/>
				<p v-if="formData.dayOfMonth > 28" class="form-help-text form-warning">
					Some months have fewer days; execution will adjust accordingly.
				</p>
			</a-form-item>
			<a-form-item label="At Hour">
				<a-input-number
					v-model:value="formData.hour"
					:min="0"
					:max="23"
					placeholder="0-23"
					style="width: 100%"
				/>
			</a-form-item>
			<a-form-item label="At Minute">
				<a-input-number
					v-model:value="formData.minute"
					:min="0"
					:max="59"
					placeholder="0-59"
					style="width: 100%"
				/>
			</a-form-item>
		</template>

		<!-- Yearly: Every X Years + Month + Day of Month + At Hour + At Minute -->
		<template v-if="formData.scheduleInterval === 'years'">
			<a-form-item label="Every X Years">
				<a-input-number
					v-model:value="formData.everyYears"
					:min="1"
					placeholder="Enter years"
					style="width: 100%"
				/>
			</a-form-item>
			<a-form-item label="Month">
				<a-select v-model:value="formData.month" placeholder="Select month">
					<a-select-option value="1">January</a-select-option>
					<a-select-option value="2">February</a-select-option>
					<a-select-option value="3">March</a-select-option>
					<a-select-option value="4">April</a-select-option>
					<a-select-option value="5">May</a-select-option>
					<a-select-option value="6">June</a-select-option>
					<a-select-option value="7">July</a-select-option>
					<a-select-option value="8">August</a-select-option>
					<a-select-option value="9">September</a-select-option>
					<a-select-option value="10">October</a-select-option>
					<a-select-option value="11">November</a-select-option>
					<a-select-option value="12">December</a-select-option>
				</a-select>
			</a-form-item>
			<a-form-item label="Day of Month">
				<a-input-number
					v-model:value="formData.dayOfMonth"
					:min="1"
					:max="31"
					placeholder="1-31"
					style="width: 100%"
				/>
			</a-form-item>
			<a-form-item label="At Hour">
				<a-input-number
					v-model:value="formData.hour"
					:min="0"
					:max="23"
					placeholder="0-23"
					style="width: 100%"
				/>
			</a-form-item>
			<a-form-item label="At Minute">
				<a-input-number
					v-model:value="formData.minute"
					:min="0"
					:max="59"
					placeholder="0-59"
					style="width: 100%"
				/>
			</a-form-item>
		</template>

		<a-form-item label="Timezone">
			<a-select v-model:value="formData.timezone" placeholder="Select timezone">
				<a-select-option value="UTC">UTC</a-select-option>
				<a-select-option value="America/New_York">America/New_York</a-select-option>
				<a-select-option value="America/Los_Angeles">America/Los_Angeles</a-select-option>
				<a-select-option value="Europe/London">Europe/London</a-select-option>
				<a-select-option value="Asia/Bangkok">Asia/Bangkok</a-select-option>
			</a-select>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

interface Props {
	modelValue: any;
}

interface Emits {
	(e: 'update:modelValue', value: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formData = reactive({
	scheduleInterval: props.modelValue?.scheduleInterval || 'days',
	timezone: props.modelValue?.timezone || 'UTC',
	// Seconds
	everySeconds: props.modelValue?.everySeconds || 1,
	// Minutes
	everyMinutes: props.modelValue?.everyMinutes || 1,
	// Hours
	everyHours: props.modelValue?.everyHours || 1,
	// Days
	everyDays: props.modelValue?.everyDays || 1,
	// Weeks
	everyWeeks: props.modelValue?.everyWeeks || 1,
	dayOfWeek: props.modelValue?.dayOfWeek || '1',
	// Months
	everyMonths: props.modelValue?.everyMonths || 1,
	dayOfMonth: props.modelValue?.dayOfMonth || 1,
	// Years
	everyYears: props.modelValue?.everyYears || 1,
	month: props.modelValue?.month || '1',
	// Time fields (shared)
	hour: props.modelValue?.hour || 0,
	minute: props.modelValue?.minute || 0,
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

	&.form-warning {
		color: $color-warning;
	}
}
</style>
