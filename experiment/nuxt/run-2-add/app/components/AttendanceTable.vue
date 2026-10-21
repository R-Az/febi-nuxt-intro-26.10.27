<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { DailyRow, MonthTotals } from '#shared/types/attendance'

const props = defineProps<{
  days: DailyRow[]
  totals: MonthTotals
  editable?: boolean
  loading?: boolean
}>()
defineEmits<{ edit: [row: DailyRow] }>()

const num = { class: { th: 'text-end', td: 'text-end' } }

const columns = computed<TableColumn<DailyRow>[]>(() => [
  { id: 'date', header: '日付', footer: '合計' },
  { id: 'clockIn', header: '出勤', footer: () => `出勤 ${props.totals.workDays}日` },
  { id: 'clockOut', header: '退勤', footer: () => `打刻漏れ ${props.totals.missingCount}件` },
  { id: 'break', header: '休憩', meta: num },
  { id: 'work', header: '実働', meta: num, footer: () => formatDuration(props.totals.workMinutes) },
  { id: 'overtime', header: '残業', meta: num, footer: () => formatDuration(props.totals.overtimeMinutes) },
  { id: 'note', header: '備考' },
  ...(props.editable ? [{ id: 'actions', meta: num }] : []),
])

function rowClass(row: { original: DailyRow }): string {
  if (row.original.missingClockOut) return 'bg-warning/10'
  const w = dayOfWeek(row.original.date)
  return w === 0 || w === 6 ? 'bg-elevated/50 [&>td]:text-dimmed' : ''
}

function breakTitle(row: DailyRow): string {
  return row.breaks.map(b => `${b.start}〜${b.end ?? ''}`).join('\n')
}
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <UTable
      :data="days"
      :columns="columns"
      :loading="loading"
      :meta="{ class: { tr: rowClass } }"
    >
      <template #date-cell="{ row }">
        {{ formatDateLabel(row.original.date) }}
      </template>
      <template #clockIn-cell="{ row }">
        {{ row.original.clockIn ?? '' }}
      </template>
      <template #clockOut-cell="{ row }">
        {{ row.original.clockOut ?? '' }}
      </template>
      <template #break-cell="{ row }">
        <span :title="breakTitle(row.original)">{{ row.original.hasRecord ? formatDuration(row.original.breakMinutes) : '' }}</span>
      </template>
      <template #work-cell="{ row }">
        {{ formatDuration(row.original.workMinutes) }}
      </template>
      <template #overtime-cell="{ row }">
        {{ formatDuration(row.original.overtimeMinutes) }}
      </template>
      <template #note-cell="{ row }">
        <UBadge v-if="row.original.missingClockOut" color="warning" variant="subtle" label="打刻漏れ" />
        <UBadge v-else-if="row.original.inProgress" color="primary" variant="subtle" label="勤務中" />
      </template>
      <!-- 見出しが空文字だとハイドレーションがずれるので、読み上げ用の見出しを置く -->
      <template #actions-header>
        <span class="sr-only">操作</span>
      </template>
      <template #actions-cell="{ row }">
        <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-pencil" label="修正" @click="$emit('edit', row.original)" />
      </template>
    </UTable>
  </UCard>
</template>
