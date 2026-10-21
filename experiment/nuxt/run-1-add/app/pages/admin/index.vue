<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { EmployeeMonthSummary } from '#shared/types/attendance'
import { formatDuration } from '#shared/utils/time'

useHead({ title: '月次一覧 | 勤怠管理' })

const month = useMonthQuery()
const { data, error } = await useFetch('/api/admin/summary', { query: { month } })

const grand = computed(() => {
  const rows = data.value?.rows ?? []
  return {
    workDays: rows.reduce((s, r) => s + r.totals.workDays, 0),
    work: rows.reduce((s, r) => s + r.totals.totalWorkMinutes, 0),
    overtime: rows.reduce((s, r) => s + r.totals.totalOvertimeMinutes, 0),
    missing: rows.reduce((s, r) => s + r.totals.missingCount, 0),
  }
})

const columns = computed<TableColumn<EmployeeMonthSummary>[]>(() => [
  { id: 'id', header: '従業員ID', accessorFn: r => r.user.id, footer: '合計' },
  { id: 'name', header: '氏名', accessorFn: r => r.user.name },
  { id: 'workDays', header: '出勤日数', accessorFn: r => `${r.totals.workDays}日`, footer: `${grand.value.workDays}日`, meta: NUMERIC_COLUMN_META },
  { id: 'work', header: '実働時間の合計', accessorFn: r => formatDuration(r.totals.totalWorkMinutes), footer: formatDuration(grand.value.work), meta: NUMERIC_COLUMN_META },
  { id: 'overtime', header: '残業時間の合計', accessorFn: r => formatDuration(r.totals.totalOvertimeMinutes), footer: formatDuration(grand.value.overtime), meta: NUMERIC_COLUMN_META },
  { id: 'missing', header: '打刻漏れ', footer: `${grand.value.missing}件`, meta: NUMERIC_COLUMN_META },
  actionsColumn<EmployeeMonthSummary>(),
])
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold">
      月次一覧
    </h1>
    <MonthPicker v-model="month" />
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      :description="getErrorMessages(error).join(' ')"
    />
    <UTable
      v-if="data"
      :data="data.rows"
      :columns="columns"
    >
      <template #missing-cell="{ row }">
        <UBadge
          v-if="row.original.totals.missingCount > 0"
          color="warning"
          variant="subtle"
        >
          {{ row.original.totals.missingCount }}件
        </UBadge>
        <span v-else>0件</span>
      </template>
      <template #actions-cell="{ row }">
        <UButton
          :to="{ path: `/admin/users/${row.original.user.id}`, query: { month } }"
          variant="link"
          size="sm"
          trailing-icon="i-lucide-chevron-right"
        >
          日別・修正
        </UButton>
      </template>
    </UTable>
    <p class="text-xs text-muted">
      時間は「時間:分」で表示しています。打刻漏れの日は出勤日数に含め、実働・残業の合計には含めません。
    </p>
  </div>
</template>
