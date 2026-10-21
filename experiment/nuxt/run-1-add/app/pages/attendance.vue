<script setup lang="ts">
useHead({ title: '勤怠一覧 | 勤怠管理' })

const { user } = useUserSession()
const month = useMonthQuery()
const { data, error } = await useFetch(() => `/api/users/${user.value?.id}/attendance`, {
  query: { month },
})
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold">
      勤怠一覧
    </h1>
    <MonthPicker v-model="month" />
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      :description="getErrorMessages(error).join(' ')"
    />
    <AttendanceTable
      v-if="data"
      :days="data.days"
      :totals="data.totals"
      :today="data.today"
    />
  </div>
</template>
