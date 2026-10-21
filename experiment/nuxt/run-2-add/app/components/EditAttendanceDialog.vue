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
</script>

<template>
  <!-- 開閉は親の v-if で行う。Esc・外側クリック・× で閉じると close を出す -->
  <UModal
    :open="true"
    :title="`${formatDateLabel(row.date)} の勤怠を修正`"
    @update:open="open => { if (!open) emit('close') }"
  >
    <template #body>
      <form class="flex flex-col gap-4" @submit.prevent="save">
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="出勤">
            <UInput v-model="clockIn" type="time" class="w-full" />
          </UFormField>
          <UFormField label="退勤">
            <UInput v-model="clockOut" type="time" class="w-full" />
          </UFormField>
        </div>

        <fieldset class="flex flex-col items-start gap-2 rounded-md border border-default p-3">
          <legend class="px-1 text-sm text-muted">
            休憩
          </legend>
          <p v-if="breaks.length === 0" class="text-sm text-muted">
            休憩はありません。
          </p>
          <div v-for="(b, i) in breaks" :key="i" class="flex flex-wrap items-center gap-2">
            <span class="min-w-14 text-sm text-muted">休憩{{ i + 1 }}</span>
            <UInput v-model="b.start" type="time" :aria-label="`休憩${i + 1} 開始`" required />
            <span>〜</span>
            <UInput v-model="b.end" type="time" :aria-label="`休憩${i + 1} 終了`" required />
            <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-trash-2" label="削除" @click="breaks.splice(i, 1)" />
          </div>
          <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-plus" label="休憩を追加" @click="addBreak" />
        </fieldset>

        <p class="text-sm text-muted">
          退勤を空にすると「打刻漏れ」のままになります。出勤・退勤・休憩をすべて空にして保存すると、その日の記録を削除します。
        </p>
        <ErrorList :messages="errors" />
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="outline" label="キャンセル" @click="emit('close')" />
          <UButton type="submit" :loading="saving" :label="saving ? '保存中…' : '保存'" />
        </div>
      </form>
    </template>
  </UModal>
</template>
