<script setup lang="ts">
useHead({ title: '勤怠一覧 | 勤怠管理' })

const { user } = useUserSession()
const month = useMonthQuery()

const { data, error, status } = await useFetch(() => `/api/users/${user.value!.id}/attendance`, {
  query: { month },
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>勤怠一覧 <small v-if="data">{{ formatMonthLabel(data.month) }}</small></h1>
      <MonthPicker v-model="month" />
    </div>
    <ErrorList v-if="error" :messages="errorMessages(error)" />
    <template v-if="data">
      <MonthTotalsBar :totals="data.totals" />
      <AttendanceTable :days="data.days" :totals="data.totals" :class="{ loading: status === 'pending' }" />
    </template>
  </div>
</template>
