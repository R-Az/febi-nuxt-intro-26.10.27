<script setup lang="ts">
import type { DayRow } from '#shared/types/attendance'

const route = useRoute()
const userId = computed(() => String(route.params.userId))
const month = useMonthQuery()
const { data, error, refresh } = await useFetch(() => `/api/users/${userId.value}/attendance`, {
  query: { month },
})

useHead({ title: () => `${data.value?.user.name ?? '従業員'}の勤怠 | 勤怠管理` })

const editing = ref<DayRow | null>(null)
const saved = ref(false)

async function onSaved() {
  editing.value = null
  saved.value = true
  await refresh()
}
</script>

<template>
  <div class="space-y-4">
    <UButton
      :to="{ path: '/admin', query: { month } }"
      variant="link"
      icon="i-lucide-chevron-left"
      class="px-0"
    >
      月次一覧へ戻る
    </UButton>
    <h1
      v-if="data"
      class="text-xl font-bold"
    >
      {{ data.user.name }}（{{ data.user.id }}）の勤怠
    </h1>
    <div class="flex flex-wrap items-center gap-3">
      <MonthPicker v-model="month" />
      <UButton
        :href="`/api/admin/export?month=${month}&userId=${userId}`"
        external
        color="neutral"
        variant="outline"
        icon="i-lucide-download"
      >
        CSVをダウンロード
      </UButton>
    </div>
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      :description="getErrorMessages(error).join(' ')"
    />
    <UAlert
      v-if="saved"
      color="success"
      variant="subtle"
      icon="i-lucide-circle-check"
      description="勤怠を更新しました。"
      role="status"
    />
    <AttendanceTable
      v-if="data"
      :days="data.days"
      :totals="data.totals"
      :today="data.today"
      editable
      @edit="(day) => { saved = false; editing = day }"
    />
    <RecordEditDialog
      v-if="editing && data"
      :key="editing.date"
      :user-id="data.user.id"
      :user-name="data.user.name"
      :day="editing"
      @close="editing = null"
      @saved="onSaved"
    />
  </div>
</template>
