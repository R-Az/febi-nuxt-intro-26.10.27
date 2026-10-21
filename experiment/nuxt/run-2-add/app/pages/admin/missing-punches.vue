<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { MissingPunchView } from '#shared/types/attendance'

useHead({ title: '打刻漏れ | 勤怠管理' })

const { data, error, refresh } = await useFetch('/api/admin/missing-punches')
const running = ref(false)
const runMessage = ref('')
const runErrors = ref<string[]>([])

const dateTimeFormat = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const columns: TableColumn<MissingPunchView>[] = [
  { id: 'date', header: '日付' },
  { id: 'user', header: '従業員' },
  { id: 'detectedAt', header: '検出日時' },
  { id: 'resolved', header: '状態' },
  { id: 'actions', meta: { class: { th: 'text-end', td: 'text-end' } } },
]

async function runNow() {
  runMessage.value = ''
  runErrors.value = []
  running.value = true
  try {
    const result = await $fetch('/api/admin/missing-punches/run', { method: 'POST' })
    runMessage.value = `${formatDateLabel(result.date)} 分を検査し、新たに ${result.detectedCount} 件を記録しました。`
    await refresh()
  }
  catch (e) {
    runErrors.value = errorMessages(e)
  }
  finally {
    running.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold">
        打刻漏れ
      </h1>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-search-check"
        :loading="running"
        :label="running ? '検査中…' : '前日分を今すぐ検査'"
        @click="runNow"
      />
    </div>
    <p class="text-muted">
      毎日0時（日本時間）に、前日に出勤したまま退勤がない記録を自動で検出しています。修正は従業員の「日別・修正」画面から行えます。
    </p>
    <UAlert v-if="runMessage" color="success" variant="subtle" icon="i-lucide-circle-check" :title="runMessage" role="status" />
    <ErrorList :messages="runErrors" />
    <ErrorList v-if="error" :messages="errorMessages(error)" />

    <UCard v-if="data" :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :data="data" :columns="columns" empty="検出された打刻漏れはありません。">
        <template #date-cell="{ row }">
          {{ formatDateLabel(row.original.date) }} <small class="text-dimmed">{{ row.original.date.slice(0, 4) }}年</small>
        </template>
        <template #user-cell="{ row }">
          {{ row.original.userId }} {{ row.original.userName }}
        </template>
        <template #detectedAt-cell="{ row }">
          {{ dateTimeFormat.format(new Date(row.original.detectedAt)) }}
        </template>
        <template #resolved-cell="{ row }">
          <UBadge v-if="row.original.resolved" color="success" variant="subtle" label="修正済み" />
          <UBadge v-else color="warning" variant="subtle" label="未対応" />
        </template>
        <!-- 見出しが空文字だとハイドレーションがずれるので、読み上げ用の見出しを置く -->
        <template #actions-header>
          <span class="sr-only">操作</span>
        </template>
        <template #actions-cell="{ row }">
          <UButton
            :to="{ path: `/admin/employees/${row.original.userId}`, query: { month: row.original.date.slice(0, 7) } }"
            size="xs"
            color="neutral"
            variant="outline"
            label="勤怠を開く"
          />
        </template>
      </UTable>
    </UCard>
  </div>
</template>
