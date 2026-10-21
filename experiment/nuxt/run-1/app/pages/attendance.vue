<script setup lang="ts">
useHead({ title: '勤怠一覧 | 勤怠管理' })

const { user } = useUserSession()
const month = useMonthQuery()
const { data, error } = await useFetch(() => `/api/users/${user.value?.id}/attendance`, {
  query: { month },
})
</script>

<template>
  <div>
    <h1>勤怠一覧</h1>
    <div class="toolbar">
      <MonthPicker v-model="month" />
    </div>
    <div
      v-if="error"
      class="alert alert-error"
    >
      {{ getErrorMessages(error).join(' ') }}
    </div>
    <AttendanceTable
      v-if="data"
      :days="data.days"
      :totals="data.totals"
      :today="data.today"
    />
  </div>
</template>
