<script setup lang="ts">
import type { DailyRow } from '#shared/types/attendance'

const route = useRoute()
const userId = computed(() => String(route.params.id))
const month = useMonthQuery()

const { data, error, refresh, status } = await useFetch(() => `/api/users/${userId.value}/attendance`, {
  query: { month },
})

useHead({ title: () => `${data.value?.user.name ?? '従業員'}の勤怠 | 勤怠管理` })

const editing = ref<DailyRow | null>(null)
const savedMessage = ref('')

function startEdit(row: DailyRow) {
  savedMessage.value = ''
  editing.value = row
}

async function onSaved(date: string) {
  editing.value = null
  savedMessage.value = `${formatDateLabel(date)} の勤怠を保存しました。`
  await refresh()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <UButton :to="{ path: '/admin', query: { month } }" variant="link" icon="i-lucide-chevron-left" label="月次一覧へ戻る" class="px-0" />
    </div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold">
        {{ data?.user.name }} の勤怠
        <small v-if="data" class="ml-2 text-sm font-normal text-muted">{{ data.user.id }} / {{ formatMonthLabel(data.month) }}</small>
      </h1>
      <MonthPicker v-model="month" />
    </div>
    <ErrorList v-if="error" :messages="errorMessages(error)" />
    <UAlert v-if="savedMessage" color="success" variant="subtle" icon="i-lucide-circle-check" :title="savedMessage" role="status" />
    <template v-if="data">
      <MonthTotalsBar :totals="data.totals" />
      <AttendanceTable :days="data.days" :totals="data.totals" :loading="status === 'pending'" editable @edit="startEdit" />
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
