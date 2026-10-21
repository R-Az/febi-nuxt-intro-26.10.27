<script setup lang="ts">
import type { DayRow, MonthTotals } from '#shared/types/attendance'
import { dayOfWeek, formatDateLabel, formatDuration, minutesToHHMM } from '#shared/utils/time'

const props = defineProps<{
  days: DayRow[]
  totals: MonthTotals
  today: string
  /** 管理者の修正用。指定すると各行に編集ボタンを出す */
  editable?: boolean
}>()

const emit = defineEmits<{ edit: [day: DayRow] }>()

function rowClass(day: DayRow) {
  const w = dayOfWeek(day.date)
  return {
    'is-sun': w === 0,
    'is-sat': w === 6,
    'is-today': day.date === props.today,
    'is-future': day.date > props.today,
  }
}

</script>

<template>
  <table class="data attendance-table">
    <thead>
      <tr>
        <th>日付</th>
        <th>出勤</th>
        <th>退勤</th>
        <th class="num">
          休憩
        </th>
        <th class="num">
          実働
        </th>
        <th class="num">
          残業
        </th>
        <th>備考</th>
        <th v-if="editable" />
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="day in days"
        :key="day.date"
        :class="rowClass(day)"
      >
        <td class="date">
          {{ formatDateLabel(day.date) }}
        </td>
        <template v-if="day.summary">
          <td>{{ minutesToHHMM(day.summary.clockIn) }}</td>
          <td>{{ day.summary.clockOut === null ? '—' : minutesToHHMM(day.summary.clockOut) }}</td>
          <td class="num">
            {{ formatDuration(day.summary.breakMinutes) }}
          </td>
          <td class="num">
            {{ day.summary.workMinutes === null ? '' : formatDuration(day.summary.workMinutes) }}
          </td>
          <td class="num">
            {{ day.summary.overtimeMinutes === null ? '' : formatDuration(day.summary.overtimeMinutes) }}
          </td>
          <td><DayStatusBadge :status="day.summary.status" /></td>
        </template>
        <template v-else>
          <td colspan="6" />
        </template>
        <td
          v-if="editable"
          class="actions"
        >
          <button
            v-if="day.date <= today"
            type="button"
            class="btn btn-sm"
            @click="emit('edit', day)"
          >
            {{ day.record ? '修正' : '登録' }}
          </button>
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td>合計</td>
        <td colspan="2">
          出勤 {{ totals.workDays }}日
        </td>
        <td class="num">
          {{ formatDuration(totals.totalBreakMinutes) }}
        </td>
        <td class="num">
          {{ formatDuration(totals.totalWorkMinutes) }}
        </td>
        <td class="num">
          {{ formatDuration(totals.totalOvertimeMinutes) }}
        </td>
        <td>
          <span v-if="totals.missingCount > 0">打刻漏れ {{ totals.missingCount }}件</span>
        </td>
        <td v-if="editable" />
      </tr>
    </tfoot>
  </table>
  <p class="muted note">
    時間は「時間:分」で表示しています。打刻漏れ・勤務中の日は実働・残業の合計に含みません。
  </p>
</template>

<style scoped>
.attendance-table tr.is-sun td.date {
  color: var(--color-danger);
}

.attendance-table tr.is-sat td.date {
  color: var(--color-primary);
}

.attendance-table tr.is-today {
  background: #fffbea;
}

.attendance-table tr.is-future td {
  color: #aab1b9;
}

.attendance-table td.actions {
  width: 1%;
  text-align: right;
}

.note {
  font-size: 12px;
  margin-top: 8px;
}
</style>
