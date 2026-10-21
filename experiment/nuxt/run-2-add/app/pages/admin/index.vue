<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { EmployeeMonthlySummary } from '#shared/types/attendance'

useHead({ title: '月次一覧 | 勤怠管理' })

const month = useMonthQuery()
const { data, error, status } = await useFetch('/api/admin/summary', { query: { month } })

const total = computed(() => (data.value?.rows ?? []).reduce(
  (acc, r) => ({
    workDays: acc.workDays + r.workDays,
    workMinutes: acc.workMinutes + r.workMinutes,
    overtimeMinutes: acc.overtimeMinutes + r.overtimeMinutes,
    missingCount: acc.missingCount + r.missingCount,
  }),
  { workDays: 0, workMinutes: 0, overtimeMinutes: 0, missingCount: 0 },
))

const num = { class: { th: 'text-end', td: 'text-end' } }

const columns: TableColumn<EmployeeMonthlySummary>[] = [
  { id: 'id', header: '従業員ID', footer: '合計' },
  { id: 'name', header: '氏名' },
  { id: 'workDays', header: '出勤日数', meta: num, footer: () => `${total.value.workDays}日` },
  { id: 'workMinutes', header: '実働時間', meta: num, footer: () => formatDuration(total.value.workMinutes) },
  { id: 'overtimeMinutes', header: '残業時間', meta: num, footer: () => formatDuration(total.value.overtimeMinutes) },
  { id: 'missingCount', header: '打刻漏れ', meta: num, footer: () => `${total.value.missingCount}件` },
  { id: 'actions', meta: num },
]
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold">
        月次一覧 <small v-if="data" class="ml-2 text-sm font-normal text-muted">{{ formatMonthLabel(data.month) }}</small>
      </h1>
      <MonthPicker v-model="month" />
    </div>
    <ErrorList v-if="error" :messages="errorMessages(error)" />
    <UCard v-if="data" :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :data="data.rows" :columns="columns" :loading="status === 'pending'">
        <template #id-cell="{ row }">
          {{ row.original.user.id }}
        </template>
        <template #name-cell="{ row }">
          {{ row.original.user.name }}
        </template>
        <template #workDays-cell="{ row }">
          {{ row.original.workDays }}日
        </template>
        <template #workMinutes-cell="{ row }">
          {{ formatDuration(row.original.workMinutes) }}
        </template>
        <template #overtimeMinutes-cell="{ row }">
          {{ formatDuration(row.original.overtimeMinutes) }}
        </template>
        <template #missingCount-cell="{ row }">
          <UBadge v-if="row.original.missingCount > 0" color="warning" variant="subtle" :label="`${row.original.missingCount}件`" />
          <span v-else>0件</span>
        </template>
        <!-- 見出しが空文字だとハイドレーションがずれるので、読み上げ用の見出しを置く -->
        <template #actions-header>
          <span class="sr-only">操作</span>
        </template>
        <template #actions-cell="{ row }">
          <UButton
            :to="{ path: `/admin/employees/${row.original.user.id}`, query: { month: data.month } }"
            size="xs"
            color="neutral"
            variant="outline"
            label="日別・修正"
          />
        </template>
      </UTable>
    </UCard>
  </div>
</template>
