<script setup lang="ts">
useHead({ title: '勤怠一覧 | 勤怠管理' })

const { user } = useUserSession()
const month = useMonthQuery()

const { data, error, status } = await useFetch(() => `/api/users/${user.value!.id}/attendance`, {
  query: { month },
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold">
        勤怠一覧 <small v-if="data" class="ml-2 text-sm font-normal text-muted">{{ formatMonthLabel(data.month) }}</small>
      </h1>
      <MonthPicker v-model="month" />
    </div>
    <ErrorList v-if="error" :messages="errorMessages(error)" />
    <template v-if="data">
      <MonthTotalsBar :totals="data.totals" />
      <AttendanceTable :days="data.days" :totals="data.totals" :loading="status === 'pending'" />
    </template>
  </div>
</template>
