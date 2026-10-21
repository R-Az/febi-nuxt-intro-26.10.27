<script setup lang="ts">
import type { PunchAction, PunchStatus } from '#shared/types/attendance'

useHead({ title: '打刻 | 勤怠管理' })

const { data: status, refresh, error: loadError } = await useFetch('/api/punch/status')

const ACTIONS: PunchAction[] = ['clockIn', 'breakStart', 'breakEnd', 'clockOut']

const now = ref<{ date: string, time: string } | null>(null)
const seconds = ref('')
const errors = ref<string[]>([])
const message = ref('')
const sending = ref(false)

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  const tick = () => {
    const d = new Date()
    now.value = nowInJst(d)
    seconds.value = String(d.getSeconds()).padStart(2, '0')
    // 日付が変わったら状態を取り直す
    if (status.value && now.value.date !== status.value.date) refresh()
  }
  tick()
  timer = setInterval(tick, 1000)
})
onBeforeUnmount(() => clearInterval(timer))

function canPress(action: PunchAction): boolean {
  return !sending.value && !!status.value?.allowedActions.includes(action)
}

async function press(action: PunchAction) {
  errors.value = []
  message.value = ''
  sending.value = true
  try {
    const next = await $fetch<PunchStatus>('/api/punch', { method: 'POST', body: { action } })
    status.value = next
    message.value = `「${PUNCH_ACTION_LABELS[action]}」を打刻しました。`
  }
  catch (e) {
    errors.value = errorMessages(e)
    await refresh()
  }
  finally {
    sending.value = false
  }
}

const today = computed(() => {
  const record = status.value?.record
  if (!record) return null
  return { ...record, ...calcDay(record, record.date) }
})
</script>

<template>
  <div class="page">
    <h1>打刻</h1>
    <ErrorList v-if="loadError" :messages="errorMessages(loadError)" />

    <section v-if="status" class="card punch-card">
      <div class="clock">
        <div class="clock-date">{{ formatDateLabel(status.date) }}</div>
        <ClientOnly>
          <div class="clock-time">{{ now?.time }}<small>:{{ seconds }}</small></div>
          <template #fallback><div class="clock-time">--:--</div></template>
        </ClientOnly>
        <div class="state" :class="`state-${status.state}`">{{ PUNCH_STATE_LABELS[status.state] }}</div>
      </div>

      <div class="punch-buttons">
        <button
          v-for="action in ACTIONS"
          :key="action"
          type="button"
          class="btn btn-punch"
          :class="`punch-${action}`"
          :disabled="!canPress(action)"
          @click="press(action)"
        >
          {{ PUNCH_ACTION_LABELS[action] }}
        </button>
      </div>

      <p v-if="message" class="alert alert-success" role="status">{{ message }}</p>
      <ErrorList :messages="errors" />
    </section>

    <section class="card">
      <h2>今日の記録</h2>
      <p v-if="!today" class="muted">まだ出勤していません。</p>
      <dl v-else class="record">
        <div><dt>出勤</dt><dd>{{ today.clockIn }}</dd></div>
        <div>
          <dt>休憩</dt>
          <dd>
            <span v-if="today.breaks.length === 0">なし</span>
            <span v-for="(b, i) in today.breaks" :key="i" class="break-item">{{ b.start }}〜{{ b.end ?? '（休憩中）' }}</span>
          </dd>
        </div>
        <div><dt>退勤</dt><dd>{{ today.clockOut ?? '—' }}</dd></div>
        <div v-if="today.workMinutes !== null"><dt>実働</dt><dd>{{ formatDuration(today.workMinutes) }}（残業 {{ formatDuration(today.overtimeMinutes) }}）</dd></div>
      </dl>
    </section>
  </div>
</template>
