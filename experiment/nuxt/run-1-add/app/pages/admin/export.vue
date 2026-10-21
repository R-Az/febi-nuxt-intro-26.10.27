<script setup lang="ts">
useHead({ title: 'CSV出力 | 勤怠管理' })

const month = useMonthQuery()
const userId = ref('all')
const { data: employees } = await useFetch('/api/admin/users')

const employeeItems = computed(() => [
  { label: '全員', value: 'all' },
  ...(employees.value ?? []).map(u => ({ label: `${u.id} ${u.name}`, value: u.id })),
])

const downloadUrl = computed(() =>
  `/api/admin/export?${new URLSearchParams({ month: month.value, userId: userId.value })}`)
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold">
      CSV出力
    </h1>
    <UCard class="max-w-xl">
      <div class="space-y-4">
        <UFormField label="対象月">
          <MonthPicker v-model="month" />
        </UFormField>
        <UFormField label="従業員">
          <USelect
            v-model="userId"
            :items="employeeItems"
            class="w-64"
          />
        </UFormField>
        <UButton
          :href="downloadUrl"
          external
          icon="i-lucide-download"
        >
          CSVをダウンロード
        </UButton>
        <p class="text-xs text-muted">
          列：従業員ID, 氏名, 日付, 出勤, 退勤, 休憩(分), 実働(分), 残業(分), 備考<br>
          勤怠がある日だけを出力します。打刻漏れの日は実働・残業が空欄になり、備考に「打刻漏れ」と入ります。<br>
          文字コードは UTF-8（BOM付き）なので、Excel でそのまま開けます。
        </p>
      </div>
    </UCard>
  </div>
</template>
