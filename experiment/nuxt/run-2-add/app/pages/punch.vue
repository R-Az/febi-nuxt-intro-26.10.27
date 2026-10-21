<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { PunchAction, PunchState, PunchStatus } from '#shared/types/attendance'

useHead({ title: '打刻 | 勤怠管理' })

const { data: status, refresh, error: loadError } = await useFetch('/api/punch/status')
const { trackPunch } = useAnalytics()

const ACTIONS: { action: PunchAction, color: ButtonProps['color'], variant: ButtonProps['variant'], icon: string }[] = [
  { action: 'clockIn', color: 'primary', variant: 'solid', icon: 'i-lucide-log-in' },
  { action: 'breakStart', color: 'neutral', variant: 'outline', icon: 'i-lucide-coffee' },
  { action: 'breakEnd', color: 'neutral', variant: 'outline', icon: 'i-lucide-briefcase' },
  { action: 'clockOut', color: 'neutral', variant: 'subtle', icon: 'i-lucide-log-out' },
]

const STATE_COLORS: Record<PunchState, 'neutral' | 'primary' | 'warning' | 'success'> = {
  notStarted: 'neutral',
  working: 'primary',
  onBreak: 'warning',
  finished: 'success',
}

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
    trackPunch(action)
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
  <div class="flex flex-col gap-4">
    <h1 class="text-2xl font-bold">
      打刻
    </h1>
    <ErrorList v-if="loadError" :messages="errorMessages(loadError)" />

    <UCard v-if="status">
      <div class="flex flex-col items-center gap-5 py-4">
        <div class="text-center">
          <div class="text-muted">
            {{ formatDateLabel(status.date) }}
          </div>
          <ClientOnly>
            <div class="text-5xl leading-tight font-bold">
              {{ now?.time }}<small class="text-2xl text-muted">:{{ seconds }}</small>
            </div>
            <template #fallback>
              <div class="text-5xl leading-tight font-bold">
                --:--
              </div>
            </template>
          </ClientOnly>
          <UBadge
            class="mt-2"
            size="lg"
            variant="subtle"
            :color="STATE_COLORS[status.state]"
            :label="PUNCH_STATE_LABELS[status.state]"
          />
        </div>

        <div class="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
          <UButton
            v-for="a in ACTIONS"
            :key="a.action"
            size="xl"
            block
            class="h-16 text-lg font-bold"
            :color="a.color"
            :variant="a.variant"
            :icon="a.icon"
            :label="PUNCH_ACTION_LABELS[a.action]"
            :disabled="!canPress(a.action)"
            @click="press(a.action)"
          />
        </div>

        <UAlert
          v-if="message"
          class="w-full max-w-2xl"
          color="success"
          variant="subtle"
          icon="i-lucide-circle-check"
          :title="message"
          role="status"
        />
        <ErrorList class="w-full max-w-2xl" :messages="errors" />
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-bold">
          今日の記録
        </h2>
      </template>
      <p v-if="!today" class="text-muted">
        まだ出勤していません。
      </p>
      <dl v-else class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <dt class="text-xs text-muted">
            出勤
          </dt>
          <dd class="font-bold">
            {{ today.clockIn }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-muted">
            休憩
          </dt>
          <dd class="font-bold">
            <span v-if="today.breaks.length === 0">なし</span>
            <span v-for="(b, i) in today.breaks" :key="i" class="block">{{ b.start }}〜{{ b.end ?? '（休憩中）' }}</span>
          </dd>
        </div>
        <div>
          <dt class="text-xs text-muted">
            退勤
          </dt>
          <dd class="font-bold">
            {{ today.clockOut ?? '—' }}
          </dd>
        </div>
        <div v-if="today.workMinutes !== null">
          <dt class="text-xs text-muted">
            実働
          </dt>
          <dd class="font-bold">
            {{ formatDuration(today.workMinutes) }}（残業 {{ formatDuration(today.overtimeMinutes) }}）
          </dd>
        </div>
      </dl>
    </UCard>
  </div>
</template>
