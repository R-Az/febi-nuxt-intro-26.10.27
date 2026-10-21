<script setup lang="ts">
useHead({ title: 'CSV出力 | 勤怠管理' })

const month = useMonthQuery()
const userId = ref('all')
const { data: employees } = await useFetch('/api/admin/users')

const downloadUrl = computed(() =>
  `/api/admin/export?${new URLSearchParams({ month: month.value, userId: userId.value })}`)
</script>

<template>
  <div>
    <h1>CSV出力</h1>
    <div class="card export-card">
      <div class="field">
        <label>対象月</label>
        <MonthPicker v-model="month" />
      </div>
      <div class="field">
        <label for="employee">従業員</label>
        <select
          id="employee"
          v-model="userId"
        >
          <option value="all">
            全員
          </option>
          <option
            v-for="u in employees ?? []"
            :key="u.id"
            :value="u.id"
          >
            {{ u.id }} {{ u.name }}
          </option>
        </select>
      </div>
      <a
        class="btn btn-primary"
        :href="downloadUrl"
      >CSVをダウンロード</a>
      <p class="muted help">
        列：従業員ID, 氏名, 日付, 出勤, 退勤, 休憩(分), 実働(分), 残業(分), 備考<br>
        勤怠がある日だけを出力します。打刻漏れの日は実働・残業が空欄になり、備考に「打刻漏れ」と入ります。<br>
        文字コードは UTF-8（BOM付き）なので、Excel でそのまま開けます。
      </p>
    </div>
  </div>
</template>

<style scoped>
.export-card {
  max-width: 560px;
}

.help {
  font-size: 12px;
  margin: 16px 0 0;
}
</style>
