<script setup lang="ts">
useHead({ title: 'CSV出力 | 勤怠管理' })

const month = useMonthQuery()
const userId = ref('all')
const errors = ref<string[]>([])
const downloading = ref(false)

const { data: employees } = await useFetch('/api/admin/employees')

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
  <div class="page">
    <h1>CSV出力</h1>
    <section class="card">
      <form class="form" @submit.prevent="download">
        <div class="field">
          <span>月</span>
          <MonthPicker v-model="month" />
        </div>
        <label class="field">
          <span>従業員</span>
          <select v-model="userId">
            <option value="all">全員</option>
            <option v-for="e in employees" :key="e.id" :value="e.id">{{ e.id }} {{ e.name }}</option>
          </select>
        </label>
        <ErrorList :messages="errors" />
        <div>
          <button type="submit" class="btn btn-primary" :disabled="downloading">
            {{ downloading ? '作成中…' : 'CSVをダウンロード' }}
          </button>
        </div>
      </form>
      <p class="muted small">
        列：従業員ID, 氏名, 日付, 出勤, 退勤, 休憩(分), 実働(分), 残業(分), 備考。UTF-8（BOM付き）で出力するので、Excel でそのまま開けます。
      </p>
    </section>
  </div>
</template>
