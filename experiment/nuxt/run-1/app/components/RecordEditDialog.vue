<script setup lang="ts">
import type { DayRow, RecordInput } from '#shared/types/attendance'
import { formatDateLabel, minutesToHHMM } from '#shared/utils/time'

const props = defineProps<{
  userId: string
  userName: string
  day: DayRow
}>()

const emit = defineEmits<{ close: [], saved: [] }>()

// 入力のチェックはサーバー側で行い、返ってきたエラーをそのまま表示する
const form = reactive<RecordInput>({
  clockIn: props.day.record ? minutesToHHMM(props.day.record.clockIn) : '09:00',
  clockOut: props.day.record?.clockOut != null ? minutesToHHMM(props.day.record.clockOut) : '',
  breaks: props.day.record
    ? props.day.record.breaks.map(b => ({ start: minutesToHHMM(b.start), end: b.end === null ? '' : minutesToHHMM(b.end) }))
    : [{ start: '12:00', end: '13:00' }],
})

const errors = ref<string[]>([])
const saving = ref(false)
const url = computed(() => `/api/admin/attendance/${props.userId}/${props.day.date}`)

async function save() {
  saving.value = true
  errors.value = []
  try {
    await $fetch(url.value, {
      method: 'PUT',
      body: { ...form, clockOut: form.clockOut || null },
    })
    emit('saved')
  }
  catch (e) {
    errors.value = getErrorMessages(e)
  }
  finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm(`${formatDateLabel(props.day.date)} の勤怠を削除します。よろしいですか？`)) return
  saving.value = true
  errors.value = []
  try {
    await $fetch(url.value, { method: 'DELETE' })
    emit('saved')
  }
  catch (e) {
    errors.value = getErrorMessages(e)
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div
    class="backdrop"
    @click.self="emit('close')"
  >
    <form
      class="dialog card"
      role="dialog"
      aria-modal="true"
      :aria-label="`${day.date} の勤怠の修正`"
      @submit.prevent="save"
    >
      <h2>{{ userName }}　{{ formatDateLabel(day.date) }} の勤怠</h2>

      <div
        v-if="errors.length"
        class="alert alert-error"
        role="alert"
      >
        <ul>
          <li
            v-for="msg in errors"
            :key="msg"
          >
            {{ msg }}
          </li>
        </ul>
      </div>

      <div class="row">
        <div class="field">
          <label for="clock-in">出勤</label>
          <input
            id="clock-in"
            v-model="form.clockIn"
            type="time"
          >
        </div>
        <div class="field">
          <label for="clock-out">退勤</label>
          <input
            id="clock-out"
            v-model="form.clockOut"
            type="time"
          >
        </div>
      </div>
      <p class="muted hint">
        退勤を空欄にすると「打刻漏れ」のままになります。
      </p>

      <div class="field">
        <label>休憩</label>
        <div
          v-for="(b, i) in form.breaks"
          :key="i"
          class="break-row"
        >
          <input
            v-model="b.start"
            type="time"
            :aria-label="`休憩${i + 1}の開始`"
          >
          <span>〜</span>
          <input
            v-model="b.end"
            type="time"
            :aria-label="`休憩${i + 1}の終了`"
          >
          <button
            type="button"
            class="btn btn-sm"
            @click="form.breaks.splice(i, 1)"
          >
            削除
          </button>
        </div>
        <div>
          <button
            type="button"
            class="btn btn-sm"
            @click="form.breaks.push({ start: '', end: '' })"
          >
            ＋ 休憩を追加
          </button>
        </div>
      </div>

      <div class="buttons">
        <button
          v-if="day.record"
          type="button"
          class="btn btn-danger"
          :disabled="saving"
          @click="remove"
        >
          この日の勤怠を削除
        </button>
        <span class="spacer" />
        <button
          type="button"
          class="btn"
          :disabled="saving"
          @click="emit('close')"
        >
          キャンセル
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="saving"
        >
          保存
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.dialog {
  width: 480px;
  max-height: 90vh;
  overflow: auto;
}

.dialog h2 {
  margin-top: 0;
}

.row {
  display: flex;
  gap: 16px;
}

.row .field {
  margin-bottom: 4px;
}

.hint {
  font-size: 12px;
  margin: 0 0 14px;
}

.break-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.buttons {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.spacer {
  flex: 1;
}
</style>
