<script setup lang="ts">
import type { DailyRow } from '#shared/types/attendance'

const route = useRoute()
const userId = computed(() => String(route.params.id))
const month = useMonthQuery()

const { data, error, refresh } = await useFetch(() => `/api/users/${userId.value}/attendance`, {
  query: { month },
})

useHead({ title: () => `${data.value?.user.name ?? '従業員'}の勤怠 | 勤怠管理` })

const editing = ref<DailyRow | null>(null)
const savedMessage = ref('')

async function onSaved(date: string) {
  editing.value = null
  savedMessage.value = `${formatDateLabel(date)} の勤怠を保存しました。`
  await refresh()
}
</script>

<template>
  <div class="page">
    <p><NuxtLink :to="{ path: '/admin', query: { month } }">‹ 月次一覧へ戻る</NuxtLink></p>
    <div class="page-header">
      <h1>
        {{ data?.user.name }} の勤怠
        <small v-if="data">{{ data.user.id }} / {{ formatMonthLabel(data.month) }}</small>
      </h1>
      <MonthPicker v-model="month" />
    </div>
    <ErrorList v-if="error" :messages="errorMessages(error)" />
    <p v-if="savedMessage" class="alert alert-success" role="status">{{ savedMessage }}</p>
    <template v-if="data">
      <MonthTotalsBar :totals="data.totals" />
      <AttendanceTable :days="data.days" :totals="data.totals" editable @edit="row => { savedMessage = ''; editing = row }" />
    </template>
    <EditAttendanceDialog
      v-if="editing"
      :user-id="userId"
      :row="editing"
      @close="editing = null"
      @saved="onSaved"
    />
  </div>
</template>
