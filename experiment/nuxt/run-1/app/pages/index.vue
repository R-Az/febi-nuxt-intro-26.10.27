<script setup lang="ts">
import type { PunchAction, PunchState } from '#shared/types/attendance'
import { PUNCH_LABELS } from '#shared/utils/attendance'
import { formatDateLabel, formatDuration, minutesToHHMM, tokyoNow } from '#shared/utils/time'

useHead({ title: '打刻 | 勤怠管理' })

const { data, refresh, error } = await useFetch('/api/attendance/today')

const ACTIONS: PunchAction[] = ['clock_in', 'break_start', 'break_end', 'clock_out']
const STATE_LABELS: Record<PunchState, string> = {
  not_started: '未出勤',
  working: '勤務中',
  on_break: '休憩中',
  finished: '退勤済み',
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
  }
  catch (e) {
    message.value = { type: 'error', text: getErrorMessages(e).join(' ') }
  }
  finally {
    sending.value = false
    await refresh()
  }
}
</script>

<template>
  <div>
    <h1>打刻</h1>
    <div
      v-if="error"
      class="alert alert-error"
    >
      {{ getErrorMessages(error).join(' ') }}
    </div>
    <div
      v-if="data"
      class="card punch-card"
    >
      <div class="clock">
        <div class="date">
          {{ formatDateLabel(data.date) }}
        </div>
        <div class="time">
          {{ now ?? '--:--' }}
        </div>
        <div>
          現在の状態：<strong :class="`state state-${data.state}`">{{ STATE_LABELS[data.state] }}</strong>
        </div>
      </div>

      <div
        v-if="message"
        class="alert"
        :class="message.type === 'success' ? 'alert-success' : 'alert-error'"
        role="status"
      >
        {{ message.text }}
      </div>

      <div class="buttons">
        <button
          v-for="action in ACTIONS"
          :key="action"
          type="button"
          class="btn punch-btn"
          :class="{ 'btn-primary': data.allowedActions.includes(action) }"
          :disabled="sending || !data.allowedActions.includes(action)"
          @click="punch(action)"
        >
          {{ PUNCH_LABELS[action] }}
        </button>
      </div>

      <table
        v-if="data.record"
        class="data today"
      >
        <tbody>
          <tr>
            <th>出勤</th>
            <td>{{ minutesToHHMM(data.record.clockIn) }}</td>
          </tr>
          <tr
            v-for="(b, i) in data.record.breaks"
            :key="i"
          >
            <th>休憩{{ i + 1 }}</th>
            <td>{{ minutesToHHMM(b.start) }} 〜 {{ b.end === null ? '（休憩中）' : minutesToHHMM(b.end) }}</td>
          </tr>
          <tr>
            <th>退勤</th>
            <td>{{ data.record.clockOut === null ? '—' : minutesToHHMM(data.record.clockOut) }}</td>
          </tr>
          <tr v-if="data.summary && data.summary.workMinutes !== null">
            <th>実働</th>
            <td>{{ formatDuration(data.summary.workMinutes) }}（残業 {{ formatDuration(data.summary.overtimeMinutes) }}）</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.punch-card {
  max-width: 560px;
}

.clock {
  text-align: center;
  margin-bottom: 20px;
}

.clock .date {
  font-size: 16px;
}

.clock .time {
  font-size: 48px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  margin: 4px 0 8px;
}

.state-working {
  color: var(--color-success);
}

.state-on_break {
  color: var(--color-warning);
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.punch-btn {
  padding: 14px 0;
  font-size: 16px;
  font-weight: 600;
}

.today th {
  width: 100px;
}
</style>
