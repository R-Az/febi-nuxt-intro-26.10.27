<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { DetectionRun, MissingPunchView } from '#shared/types/attendance'
import { addDays, formatDateLabel, formatDateTimeJST, minutesToHHMM, monthOf, tokyoNow } from '#shared/utils/time'

useHead({ title: '打刻漏れ | 勤怠管理' })

const { data, error, refresh } = await useFetch('/api/admin/missing-punches')

const yesterday = addDays(tokyoNow().date, -1)
const targetDate = ref(yesterday)
const running = ref(false)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

async function runNow() {
  running.value = true
  message.value = null
  try {
    const { run } = await $fetch('/api/admin/missing-punches/run', { method: 'POST', body: { date: targetDate.value } })
    message.value = { type: 'success', text: `${run.targetDate} の打刻漏れを検出しました：${run.found}件（新規 ${run.added}件）` }
    await refresh()
  }
  catch (e) {
    message.value = { type: 'error', text: getErrorMessages(e).join(' ') }
  }
  finally {
    running.value = false
  }
}

const entryColumns: TableColumn<MissingPunchView>[] = [
  { id: 'date', header: '対象日', accessorFn: e => formatDateLabel(e.date) },
  { id: 'user', header: '従業員', accessorFn: e => `${e.userId} ${e.userName}` },
  { id: 'clockIn', header: '出勤', accessorFn: e => minutesToHHMM(e.clockIn) },
  { id: 'detectedAt', header: '検出日時', accessorFn: e => formatDateTimeJST(e.detectedAt) },
  { id: 'resolved', header: '状態' },
  actionsColumn<MissingPunchView>(),
]
const runColumns: TableColumn<DetectionRun>[] = [
  { id: 'ranAt', header: '実行日時', accessorFn: r => formatDateTimeJST(r.ranAt) },
  { accessorKey: 'targetDate', header: '対象日' },
  { id: 'trigger', header: '実行方法', accessorFn: r => r.trigger === 'schedule' ? '定期（毎日0時）' : '手動' },
  { id: 'found', header: '検出件数', accessorFn: r => `${r.found}件`, meta: NUMERIC_COLUMN_META },
  { id: 'added', header: '新規', accessorFn: r => `${r.added}件`, meta: NUMERIC_COLUMN_META },
]
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold">
      打刻漏れ
    </h1>
    <p class="text-sm text-muted">
      毎日0時（日本時間）に、前日の打刻漏れ（出勤だけ打刻して退勤がない日）を自動で検出して記録します。
    </p>

    <UCard>
      <div class="space-y-3">
        <div class="flex flex-wrap items-end gap-3">
          <UFormField label="対象日">
            <UInput
              v-model="targetDate"
              type="date"
              :max="yesterday"
            />
          </UFormField>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-search"
            :loading="running"
            :disabled="!targetDate"
            @click="runNow"
          >
            今すぐ検出
          </UButton>
        </div>
        <UAlert
          v-if="message"
          :color="message.type === 'success' ? 'success' : 'error'"
          variant="subtle"
          :description="message.text"
          role="status"
        />
      </div>
    </UCard>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      :description="getErrorMessages(error).join(' ')"
    />

    <template v-if="data">
      <h2 class="pt-2 text-base font-bold">
        検出した打刻漏れ
      </h2>
      <UTable
        :data="data.entries"
        :columns="entryColumns"
        empty="まだ検出された打刻漏れはありません。"
      >
        <template #resolved-cell="{ row }">
          <UBadge
            v-if="row.original.resolved"
            color="success"
            variant="subtle"
          >
            修正済み
          </UBadge>
          <UBadge
            v-else
            color="warning"
            variant="subtle"
          >
            未修正
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <UButton
            :to="{ path: `/admin/users/${row.original.userId}`, query: { month: monthOf(row.original.date) } }"
            variant="link"
            size="sm"
            trailing-icon="i-lucide-chevron-right"
          >
            修正する
          </UButton>
        </template>
      </UTable>

      <h2 class="pt-2 text-base font-bold">
        検出処理の実行履歴
      </h2>
      <UTable
        :data="data.runs"
        :columns="runColumns"
        empty="まだ実行されていません。"
      />
    </template>
  </div>
</template>
