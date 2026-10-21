<script setup lang="ts">
import type { BadgeProps, TableColumn } from '@nuxt/ui'
import type { PunchAction, PunchState } from '#shared/types/attendance'
import { PUNCH_LABELS } from '#shared/utils/attendance'
import { formatDateLabel, formatDuration, minutesToHHMM, tokyoNow } from '#shared/utils/time'

useHead({ title: '打刻 | 勤怠管理' })

const { data, refresh, error } = await useFetch('/api/attendance/today')
const { trackEvent } = useAnalytics()

const ACTIONS: PunchAction[] = ['clock_in', 'break_start', 'break_end', 'clock_out']
const STATE_LABELS: Record<PunchState, string> = {
  not_started: '未出勤',
  working: '勤務中',
  on_break: '休憩中',
  finished: '退勤済み',
}
const STATE_COLORS: Record<PunchState, BadgeProps['color']> = {
  not_started: 'neutral',
  working: 'success',
  on_break: 'warning',
  finished: 'info',
}

const now = ref<string | null>(null)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  const tick = () => {
    now.value = minutesToHHMM(tokyoNow().minutes)
  }
  tick()
  timer = setInterval(tick, 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const sending = ref(false)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

async function punch(action: PunchAction) {
  sending.value = true
  message.value = null
  try {
    await $fetch('/api/attendance/punch', { method: 'POST', body: { action } })
    message.value = { type: 'success', text: `${PUNCH_LABELS[action]}を打刻しました。` }
    trackEvent('punch', { punch_type: action, punch_label: PUNCH_LABELS[action] })
  }
  catch (e) {
    message.value = { type: 'error', text: getErrorMessages(e).join(' ') }
  }
  finally {
    sending.value = false
    await refresh()
  }
}

/** 今日の打刻の内訳（項目と時刻の2列） */
const todayRows = computed(() => {
  const record = data.value?.record
  if (!record) return []
  const rows = [{ label: '出勤', value: minutesToHHMM(record.clockIn) }]
  record.breaks.forEach((b, i) => {
    rows.push({ label: `休憩${i + 1}`, value: `${minutesToHHMM(b.start)} 〜 ${b.end === null ? '（休憩中）' : minutesToHHMM(b.end)}` })
  })
  rows.push({ label: '退勤', value: record.clockOut === null ? '—' : minutesToHHMM(record.clockOut) })
  const summary = data.value?.summary
  if (summary && summary.workMinutes !== null) {
    rows.push({ label: '実働', value: `${formatDuration(summary.workMinutes)}（残業 ${formatDuration(summary.overtimeMinutes)}）` })
  }
  return rows
})
const todayColumns: TableColumn<{ label: string, value: string }>[] = [
  { accessorKey: 'label', header: '項目', meta: { class: { td: 'w-24 font-medium text-highlighted' } } },
  { accessorKey: 'value', header: '時刻' },
]
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold">
      打刻
    </h1>
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      :description="getErrorMessages(error).join(' ')"
    />
    <UCard
      v-if="data"
      class="max-w-xl"
    >
      <div class="space-y-5">
        <div class="text-center">
          <div>{{ formatDateLabel(data.date) }}</div>
          <div class="my-1 text-5xl font-bold tabular-nums">
            {{ now ?? '--:--' }}
          </div>
          <div class="flex items-center justify-center gap-2">
            現在の状態：
            <UBadge
              :color="STATE_COLORS[data.state]"
              variant="subtle"
              size="lg"
            >
              {{ STATE_LABELS[data.state] }}
            </UBadge>
          </div>
        </div>

        <UAlert
          v-if="message"
          :color="message.type === 'success' ? 'success' : 'error'"
          variant="subtle"
          :icon="message.type === 'success' ? 'i-lucide-circle-check' : 'i-lucide-circle-alert'"
          :description="message.text"
          role="status"
        />

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <UButton
            v-for="action in ACTIONS"
            :key="action"
            size="xl"
            block
            :color="data.allowedActions.includes(action) ? 'primary' : 'neutral'"
            :variant="data.allowedActions.includes(action) ? 'solid' : 'outline'"
            :disabled="sending || !data.allowedActions.includes(action)"
            @click="punch(action)"
          >
            {{ PUNCH_LABELS[action] }}
          </UButton>
        </div>

        <UTable
          v-if="todayRows.length"
          :data="todayRows"
          :columns="todayColumns"
        />
      </div>
    </UCard>
  </div>
</template>
