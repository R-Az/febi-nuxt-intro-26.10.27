<script setup lang="ts">
import type { MonthTotals } from '#shared/types/attendance'

defineProps<{ totals: MonthTotals }>()
</script>

<template>
  <dl class="totals">
    <div><dt>出勤日数</dt><dd>{{ totals.workDays }}日</dd></div>
    <div><dt>実働時間</dt><dd>{{ formatDuration(totals.workMinutes) }}</dd></div>
    <div><dt>残業時間</dt><dd>{{ formatDuration(totals.overtimeMinutes) }}</dd></div>
    <div :class="{ warn: totals.missingCount > 0 }"><dt>打刻漏れ</dt><dd>{{ totals.missingCount }}件</dd></div>
  </dl>
</template>
