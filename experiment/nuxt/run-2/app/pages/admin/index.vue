<script setup lang="ts">
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
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>月次一覧 <small v-if="data">{{ formatMonthLabel(data.month) }}</small></h1>
      <MonthPicker v-model="month" />
    </div>
    <ErrorList v-if="error" :messages="errorMessages(error)" />
    <div v-if="data" class="table-wrap">
      <table class="table" :class="{ loading: status === 'pending' }">
        <thead>
          <tr>
            <th>従業員ID</th>
            <th>氏名</th>
            <th class="num">出勤日数</th>
            <th class="num">実働時間</th>
            <th class="num">残業時間</th>
            <th class="num">打刻漏れ</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in data.rows" :key="row.user.id">
            <td>{{ row.user.id }}</td>
            <td>{{ row.user.name }}</td>
            <td class="num">{{ row.workDays }}日</td>
            <td class="num">{{ formatDuration(row.workMinutes) }}</td>
            <td class="num">{{ formatDuration(row.overtimeMinutes) }}</td>
            <td class="num">
              <span :class="{ 'badge badge-warn': row.missingCount > 0 }">{{ row.missingCount }}件</span>
            </td>
            <td class="actions">
              <NuxtLink :to="{ path: `/admin/employees/${row.user.id}`, query: { month: data.month } }" class="btn btn-small">
                日別・修正
              </NuxtLink>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th colspan="2">合計</th>
            <td class="num">{{ total.workDays }}日</td>
            <td class="num">{{ formatDuration(total.workMinutes) }}</td>
            <td class="num">{{ formatDuration(total.overtimeMinutes) }}</td>
            <td class="num">{{ total.missingCount }}件</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
