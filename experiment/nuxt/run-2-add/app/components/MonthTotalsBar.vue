<script setup lang="ts">
import type { MonthTotals } from '#shared/types/attendance'

const props = defineProps<{ totals: MonthTotals }>()

const items = computed(() => [
  { label: '出勤日数', value: `${props.totals.workDays}日`, warn: false },
  { label: '実働時間', value: formatDuration(props.totals.workMinutes), warn: false },
  { label: '残業時間', value: formatDuration(props.totals.overtimeMinutes), warn: false },
  { label: '打刻漏れ', value: `${props.totals.missingCount}件`, warn: props.totals.missingCount > 0 },
])
</script>

<template>
  <dl class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <UCard v-for="item in items" :key="item.label" :ui="{ body: 'p-3 sm:p-4' }">
      <dt class="text-xs text-muted">
        {{ item.label }}
      </dt>
      <dd class="text-xl font-bold" :class="{ 'text-warning': item.warn }">
        {{ item.value }}
      </dd>
    </UCard>
  </dl>
</template>
