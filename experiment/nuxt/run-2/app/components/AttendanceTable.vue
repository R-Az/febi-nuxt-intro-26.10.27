<script setup lang="ts">
import type { DailyRow, MonthTotals } from '#shared/types/attendance'

defineProps<{
  days: DailyRow[]
  totals: MonthTotals
  editable?: boolean
}>()
defineEmits<{ edit: [row: DailyRow] }>()

function breakTitle(row: DailyRow): string {
  return row.breaks.map(b => `${b.start}〜${b.end ?? ''}`).join('\n')
}
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>日付</th>
          <th>出勤</th>
          <th>退勤</th>
          <th class="num">休憩</th>
          <th class="num">実働</th>
          <th class="num">残業</th>
          <th>備考</th>
          <th v-if="editable" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in days"
          :key="row.date"
          :class="{ weekend: dayOfWeek(row.date) === 0 || dayOfWeek(row.date) === 6, missing: row.missingClockOut }"
        >
          <td>{{ formatDateLabel(row.date) }}</td>
          <td>{{ row.clockIn ?? '' }}</td>
          <td>{{ row.clockOut ?? '' }}</td>
          <td class="num" :title="breakTitle(row)">{{ row.hasRecord ? formatDuration(row.breakMinutes) : '' }}</td>
          <td class="num">{{ formatDuration(row.workMinutes) }}</td>
          <td class="num">{{ formatDuration(row.overtimeMinutes) }}</td>
          <td>
            <span v-if="row.missingClockOut" class="badge badge-warn">打刻漏れ</span>
            <span v-else-if="row.inProgress" class="badge badge-info">勤務中</span>
          </td>
          <td v-if="editable" class="actions">
            <button type="button" class="btn btn-small" @click="$emit('edit', row)">修正</button>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th>合計</th>
          <td colspan="3">出勤 {{ totals.workDays }}日 / 打刻漏れ {{ totals.missingCount }}件</td>
          <td class="num">{{ formatDuration(totals.workMinutes) }}</td>
          <td class="num">{{ formatDuration(totals.overtimeMinutes) }}</td>
          <td :colspan="editable ? 2 : 1" />
        </tr>
      </tfoot>
    </table>
  </div>
</template>
