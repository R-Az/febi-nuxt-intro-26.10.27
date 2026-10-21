<script setup lang="ts">
useHead({ title: '打刻漏れ | 勤怠管理' })

const { data, error, refresh } = await useFetch('/api/admin/missing-punches')
const running = ref(false)
const runMessage = ref('')
const runErrors = ref<string[]>([])

const dateTimeFormat = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

async function runNow() {
  runMessage.value = ''
  runErrors.value = []
  running.value = true
  try {
    const result = await $fetch('/api/admin/missing-punches/run', { method: 'POST' })
    runMessage.value = `${formatDateLabel(result.date)} 分を検査し、新たに ${result.detectedCount} 件を記録しました。`
    await refresh()
  }
  catch (e) {
    runErrors.value = errorMessages(e)
  }
  finally {
    running.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>打刻漏れ</h1>
      <button type="button" class="btn" :disabled="running" @click="runNow">
        {{ running ? '検査中…' : '前日分を今すぐ検査' }}
      </button>
    </div>
    <p class="muted">
      毎日0時（日本時間）に、前日に出勤したまま退勤がない記録を自動で検出しています。修正は従業員の「日別・修正」画面から行えます。
    </p>
    <p v-if="runMessage" class="alert alert-success" role="status">{{ runMessage }}</p>
    <ErrorList :messages="runErrors" />
    <ErrorList v-if="error" :messages="errorMessages(error)" />

    <div v-if="data" class="table-wrap">
      <p v-if="data.length === 0" class="muted">検出された打刻漏れはありません。</p>
      <table v-else class="table">
        <thead>
          <tr>
            <th>日付</th>
            <th>従業員</th>
            <th>検出日時</th>
            <th>状態</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in data" :key="log.id">
            <td>{{ formatDateLabel(log.date) }} <small class="muted">{{ log.date.slice(0, 4) }}年</small></td>
            <td>{{ log.userId }} {{ log.userName }}</td>
            <td>{{ dateTimeFormat.format(new Date(log.detectedAt)) }}</td>
            <td>
              <span v-if="log.resolved" class="badge badge-ok">修正済み</span>
              <span v-else class="badge badge-warn">未対応</span>
            </td>
            <td class="actions">
              <NuxtLink :to="{ path: `/admin/employees/${log.userId}`, query: { month: log.date.slice(0, 7) } }" class="btn btn-small">
                勤怠を開く
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
