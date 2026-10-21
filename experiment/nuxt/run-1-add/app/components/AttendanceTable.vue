<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
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

const columns = computed<TableColumn<DayRow>[]>(() => {
  const t = props.totals
  const cols: TableColumn<DayRow>[] = [
    { id: 'date', header: '日付', footer: '合計' },
    { id: 'clockIn', header: '出勤', footer: `出勤 ${t.workDays}日` },
    { id: 'clockOut', header: '退勤' },
    { id: 'break', header: '休憩', footer: formatDuration(t.totalBreakMinutes), meta: NUMERIC_COLUMN_META },
    { id: 'work', header: '実働', footer: formatDuration(t.totalWorkMinutes), meta: NUMERIC_COLUMN_META },
    { id: 'overtime', header: '残業', footer: formatDuration(t.totalOvertimeMinutes), meta: NUMERIC_COLUMN_META },
    { id: 'status', header: '備考', footer: t.missingCount > 0 ? `打刻漏れ ${t.missingCount}件` : undefined },
  ]
  if (props.editable) cols.push(actionsColumn<DayRow>())
  return cols
})

function dateClass(date: string) {
  const w = dayOfWeek(date)
  if (w === 0) return 'text-error'
  if (w === 6) return 'text-info'
  return ''
}

function rowClass(row: TableRow<DayRow>) {
  const date = row.original.date
  if (date === props.today) return 'bg-warning/10'
  if (date > props.today) return '[&>td]:text-dimmed'
  return ''
}
</script>

<template>
  <div>
    <UTable
      :data="days"
      :columns="columns"
      :meta="{ class: { tr: rowClass } }"
    >
      <template #date-cell="{ row }">
        <span :class="dateClass(row.original.date)">{{ formatDateLabel(row.original.date) }}</span>
      </template>
      <template #clockIn-cell="{ row }">
        {{ row.original.summary ? minutesToHHMM(row.original.summary.clockIn) : '' }}
      </template>
      <template #clockOut-cell="{ row }">
        <template v-if="row.original.summary">
          {{ row.original.summary.clockOut === null ? '—' : minutesToHHMM(row.original.summary.clockOut) }}
        </template>
      </template>
      <template #break-cell="{ row }">
        {{ row.original.summary ? formatDuration(row.original.summary.breakMinutes) : '' }}
      </template>
      <template #work-cell="{ row }">
        {{ row.original.summary?.workMinutes == null ? '' : formatDuration(row.original.summary.workMinutes) }}
      </template>
      <template #overtime-cell="{ row }">
        {{ row.original.summary?.overtimeMinutes == null ? '' : formatDuration(row.original.summary.overtimeMinutes) }}
      </template>
      <template #status-cell="{ row }">
        <DayStatusBadge
          v-if="row.original.summary"
          :status="row.original.summary.status"
        />
      </template>
      <template #actions-cell="{ row }">
        <UButton
          v-if="row.original.date <= today"
          size="xs"
          color="neutral"
          variant="outline"
          @click="emit('edit', row.original)"
        >
          {{ row.original.record ? '修正' : '登録' }}
        </UButton>
      </template>
    </UTable>
    <p class="mt-2 text-xs text-muted">
      時間は「時間:分」で表示しています。打刻漏れ・勤務中の日は実働・残業の合計に含みません。
    </p>
  </div>
</template>
