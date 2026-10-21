<script setup lang="ts">
useHead({ title: 'CSV出力 | 勤怠管理' })

const month = useMonthQuery()
const userId = ref('all')
const errors = ref<string[]>([])
const downloading = ref(false)

const { data: employees } = await useFetch('/api/admin/employees')

const employeeItems = computed(() => [
  { label: '全員', value: 'all' },
  ...(employees.value ?? []).map(e => ({ label: `${e.id} ${e.name}`, value: e.id })),
])

async function download() {
  errors.value = []
  downloading.value = true
  try {
    const query = { month: month.value, userId: userId.value }
    const blob = await $fetch<Blob>('/api/admin/export', { query, responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${query.month}_${query.userId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  catch (e) {
    errors.value = errorMessages(e)
  }
  finally {
    downloading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-2xl font-bold">
      CSV出力
    </h1>
    <UCard>
      <form class="flex flex-col gap-4" @submit.prevent="download">
        <UFormField label="月">
          <MonthPicker v-model="month" />
        </UFormField>
        <UFormField label="従業員">
          <USelect v-model="userId" :items="employeeItems" class="w-full max-w-xs" />
        </UFormField>
        <ErrorList :messages="errors" />
        <div>
          <UButton
            type="submit"
            icon="i-lucide-download"
            :loading="downloading"
            :label="downloading ? '作成中…' : 'CSVをダウンロード'"
          />
        </div>
      </form>
      <p class="mt-4 text-sm text-muted">
        列：従業員ID, 氏名, 日付, 出勤, 退勤, 休憩(分), 実働(分), 残業(分), 備考。UTF-8（BOM付き）で出力するので、Excel でそのまま開けます。
      </p>
    </UCard>
  </div>
</template>
