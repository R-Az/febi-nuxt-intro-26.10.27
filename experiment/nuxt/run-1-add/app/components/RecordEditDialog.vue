<script setup lang="ts">
import type { DayRow, RecordInput } from '#shared/types/attendance'
import { formatDateLabel, minutesToHHMM } from '#shared/utils/time'

const props = defineProps<{
  userId: string
  userName: string
  day: DayRow
}>()

const emit = defineEmits<{ close: [], saved: [] }>()

// 入力のチェックはサーバー側で行い、返ってきたエラーをそのまま表示する。
// 退勤は入力欄では空文字で持ち、送るときに null にする
const form = reactive<RecordInput & { clockOut: string }>({
  clockIn: props.day.record ? minutesToHHMM(props.day.record.clockIn) : '09:00',
  clockOut: props.day.record?.clockOut != null ? minutesToHHMM(props.day.record.clockOut) : '',
  breaks: props.day.record
    ? props.day.record.breaks.map(b => ({ start: minutesToHHMM(b.start), end: b.end === null ? '' : minutesToHHMM(b.end) }))
    : [{ start: '12:00', end: '13:00' }],
})

const errors = ref<string[]>([])
const saving = ref(false)
/** 削除ボタンを押したあとの確認中 */
const confirmingDelete = ref(false)
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
  saving.value = true
  errors.value = []
  try {
    await $fetch(url.value, { method: 'DELETE' })
    emit('saved')
  }
  catch (e) {
    errors.value = getErrorMessages(e)
    confirmingDelete.value = false
  }
  finally {
    saving.value = false
  }
}

function onUpdateOpen(open: boolean) {
  if (!open) emit('close')
}
</script>

<template>
  <UModal
    :open="true"
    :title="`${userName} ${formatDateLabel(day.date)} の勤怠`"
    description="出勤・退勤・休憩の時刻を修正します。"
    :dismissible="!saving"
    @update:open="onUpdateOpen"
  >
    <template #body>
      <UForm
        id="record-edit-form"
        :state="form"
        class="space-y-4"
        @submit="save"
      >
        <UAlert
          v-if="errors.length"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          title="保存できませんでした"
          role="alert"
        >
          <template #description>
            <ul class="list-disc ps-5">
              <li
                v-for="msg in errors"
                :key="msg"
              >
                {{ msg }}
              </li>
            </ul>
          </template>
        </UAlert>

        <div class="grid grid-cols-2 gap-4">
          <UFormField
            label="出勤"
            name="clockIn"
          >
            <UInput
              v-model="form.clockIn"
              type="time"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="退勤"
            name="clockOut"
          >
            <UInput
              v-model="form.clockOut"
              type="time"
              class="w-full"
            />
          </UFormField>
        </div>
        <p class="-mt-2 text-xs text-muted">
          退勤を空欄にすると「打刻漏れ」のままになります。
        </p>

        <UFormField label="休憩">
          <div class="space-y-2">
            <div
              v-for="(b, i) in form.breaks"
              :key="i"
              class="flex items-center gap-2"
            >
              <UInput
                v-model="b.start"
                type="time"
                :aria-label="`休憩${i + 1}の開始`"
              />
              <span>〜</span>
              <UInput
                v-model="b.end"
                type="time"
                :aria-label="`休憩${i + 1}の終了`"
              />
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-trash-2"
                :aria-label="`休憩${i + 1}を削除`"
                @click="form.breaks.splice(i, 1)"
              />
            </div>
            <UButton
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-plus"
              @click="form.breaks.push({ start: '', end: '' })"
            >
              休憩を追加
            </UButton>
          </div>
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div
        v-if="confirmingDelete"
        class="flex w-full flex-wrap items-center gap-2"
        role="alert"
      >
        <span class="flex-1 text-sm text-error">
          {{ formatDateLabel(day.date) }} の勤怠を削除します。よろしいですか？
        </span>
        <UButton
          color="neutral"
          variant="outline"
          :disabled="saving"
          @click="confirmingDelete = false"
        >
          やめる
        </UButton>
        <UButton
          color="error"
          :loading="saving"
          @click="remove"
        >
          削除する
        </UButton>
      </div>
      <div
        v-else
        class="flex w-full flex-wrap items-center gap-2"
      >
        <UButton
          v-if="day.record"
          color="error"
          variant="ghost"
          :disabled="saving"
          @click="confirmingDelete = true"
        >
          この日の勤怠を削除
        </UButton>
        <span class="flex-1" />
        <UButton
          color="neutral"
          variant="outline"
          :disabled="saving"
          @click="emit('close')"
        >
          キャンセル
        </UButton>
        <UButton
          type="submit"
          form="record-edit-form"
          :loading="saving"
        >
          保存
        </UButton>
      </div>
    </template>
  </UModal>
</template>
