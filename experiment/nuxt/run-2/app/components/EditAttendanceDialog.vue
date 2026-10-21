<script setup lang="ts">
import type { DailyRow } from '#shared/types/attendance'

const props = defineProps<{ userId: string, row: DailyRow }>()
const emit = defineEmits<{ close: [], saved: [date: string] }>()

const clockIn = ref(props.row.clockIn ?? '')
const clockOut = ref(props.row.clockOut ?? '')
const breaks = ref(props.row.breaks.map(b => ({ start: b.start, end: b.end ?? '' })))
const errors = ref<string[]>([])
const saving = ref(false)

function addBreak() {
  breaks.value.push({ start: '', end: '' })
}

async function save() {
  errors.value = []
  saving.value = true
  try {
    await $fetch(`/api/admin/attendance/${props.userId}/${props.row.date}`, {
      method: 'PUT',
      body: { clockIn: clockIn.value, clockOut: clockOut.value, breaks: breaks.value },
    })
    emit('saved', props.row.date)
  }
  catch (e) {
    errors.value = errorMessages(e)
  }
  finally {
    saving.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal card" role="dialog" aria-modal="true" aria-labelledby="edit-title">
      <h2 id="edit-title">{{ formatDateLabel(row.date) }} の勤怠を修正</h2>
      <form class="form" @submit.prevent="save">
        <div class="form-row">
          <label class="field">
            <span>出勤</span>
            <input v-model="clockIn" type="time">
          </label>
          <label class="field">
            <span>退勤</span>
            <input v-model="clockOut" type="time">
          </label>
        </div>

        <fieldset class="breaks">
          <legend>休憩</legend>
          <p v-if="breaks.length === 0" class="muted">休憩はありません。</p>
          <div v-for="(b, i) in breaks" :key="i" class="form-row break-row">
            <span class="break-no">休憩{{ i + 1 }}</span>
            <input v-model="b.start" type="time" :aria-label="`休憩${i + 1} 開始`" required>
            <span>〜</span>
            <input v-model="b.end" type="time" :aria-label="`休憩${i + 1} 終了`" required>
            <button type="button" class="btn btn-small btn-ghost" @click="breaks.splice(i, 1)">削除</button>
          </div>
          <button type="button" class="btn btn-small" @click="addBreak">＋ 休憩を追加</button>
        </fieldset>

        <p class="muted small">
          退勤を空にすると「打刻漏れ」のままになります。出勤・退勤・休憩をすべて空にして保存すると、その日の記録を削除します。
        </p>
        <ErrorList :messages="errors" />
        <div class="modal-actions">
          <button type="button" class="btn" @click="emit('close')">キャンセル</button>
          <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? '保存中…' : '保存' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
