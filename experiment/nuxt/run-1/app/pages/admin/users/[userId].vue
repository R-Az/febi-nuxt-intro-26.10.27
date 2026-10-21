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
  <div>
    <p>
      <NuxtLink :to="{ path: '/admin', query: { month } }">
        ‹ 月次一覧へ戻る
      </NuxtLink>
    </p>
    <h1 v-if="data">
      {{ data.user.name }}（{{ data.user.id }}）の勤怠
    </h1>
    <div class="toolbar">
      <MonthPicker v-model="month" />
      <a
        class="btn btn-sm"
        :href="`/api/admin/export?month=${month}&userId=${userId}`"
      >CSVをダウンロード</a>
    </div>
    <div
      v-if="error"
      class="alert alert-error"
    >
      {{ getErrorMessages(error).join(' ') }}
    </div>
    <div
      v-if="saved"
      class="alert alert-success"
      role="status"
    >
      勤怠を更新しました。
    </div>
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
