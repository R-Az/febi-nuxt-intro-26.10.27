<script setup lang="ts">
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
</script>

<template>
  <div>
    <h1>月次一覧</h1>
    <div class="toolbar">
      <MonthPicker v-model="month" />
    </div>
    <div
      v-if="error"
      class="alert alert-error"
    >
      {{ getErrorMessages(error).join(' ') }}
    </div>
    <table
      v-if="data"
      class="data"
    >
      <thead>
        <tr>
          <th>従業員ID</th>
          <th>氏名</th>
          <th class="num">
            出勤日数
          </th>
          <th class="num">
            実働時間の合計
          </th>
          <th class="num">
            残業時間の合計
          </th>
          <th class="num">
            打刻漏れ
          </th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in data.rows"
          :key="row.user.id"
        >
          <td>{{ row.user.id }}</td>
          <td>{{ row.user.name }}</td>
          <td class="num">
            {{ row.totals.workDays }}日
          </td>
          <td class="num">
            {{ formatDuration(row.totals.totalWorkMinutes) }}
          </td>
          <td class="num">
            {{ formatDuration(row.totals.totalOvertimeMinutes) }}
          </td>
          <td class="num">
            <span
              v-if="row.totals.missingCount > 0"
              class="badge badge-warning"
            >{{ row.totals.missingCount }}件</span>
            <span v-else>0件</span>
          </td>
          <td class="num">
            <NuxtLink :to="{ path: `/admin/users/${row.user.id}`, query: { month } }">
              日別・修正
            </NuxtLink>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2">
            合計
          </td>
          <td class="num">
            {{ grand.workDays }}日
          </td>
          <td class="num">
            {{ formatDuration(grand.work) }}
          </td>
          <td class="num">
            {{ formatDuration(grand.overtime) }}
          </td>
          <td class="num">
            {{ grand.missing }}件
          </td>
          <td />
        </tr>
      </tfoot>
    </table>
    <p class="muted">
      時間は「時間:分」で表示しています。打刻漏れの日は出勤日数に含め、実働・残業の合計には含めません。
    </p>
  </div>
</template>
