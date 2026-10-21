<script setup lang="ts">
import { addDays, formatDateLabel, formatDateTimeJST, minutesToHHMM, monthOf, tokyoNow } from '#shared/utils/time'

useHead({ title: '打刻漏れ | 勤怠管理' })

const { data, error, refresh } = await useFetch('/api/admin/missing-punches')

const yesterday = addDays(tokyoNow().date, -1)
const targetDate = ref(yesterday)
const running = ref(false)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

async function runNow() {
  running.value = true
  message.value = null
  try {
    const { run } = await $fetch('/api/admin/missing-punches/run', { method: 'POST', body: { date: targetDate.value } })
    message.value = { type: 'success', text: `${run.targetDate} の打刻漏れを検出しました：${run.found}件（新規 ${run.added}件）` }
    await refresh()
  }
  catch (e) {
    message.value = { type: 'error', text: getErrorMessages(e).join(' ') }
  }
  finally {
    running.value = false
  }
}
</script>

<template>
  <div>
    <h1>打刻漏れ</h1>
    <p class="muted">
      毎日0時（日本時間）に、前日の打刻漏れ（出勤だけ打刻して退勤がない日）を自動で検出して記録します。
    </p>

    <div class="card run-card">
      <div class="toolbar run">
        <label for="target-date">対象日</label>
        <input
          id="target-date"
          v-model="targetDate"
          type="date"
          :max="yesterday"
        >
        <button
          type="button"
          class="btn"
          :disabled="running || !targetDate"
          @click="runNow"
        >
          今すぐ検出
        </button>
      </div>
      <div
        v-if="message"
        class="alert"
        :class="message.type === 'success' ? 'alert-success' : 'alert-error'"
        role="status"
      >
        {{ message.text }}
      </div>
    </div>

    <div
      v-if="error"
      class="alert alert-error"
    >
      {{ getErrorMessages(error).join(' ') }}
    </div>

    <template v-if="data">
      <h2>検出した打刻漏れ</h2>
      <table class="data">
        <thead>
          <tr>
            <th>対象日</th>
            <th>従業員</th>
            <th>出勤</th>
            <th>検出日時</th>
            <th>状態</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-if="data.entries.length === 0">
            <td
              colspan="6"
              class="muted"
            >
              まだ検出された打刻漏れはありません。
            </td>
          </tr>
          <tr
            v-for="e in data.entries"
            :key="e.id"
          >
            <td>{{ formatDateLabel(e.date) }}</td>
            <td>{{ e.userId }} {{ e.userName }}</td>
            <td>{{ minutesToHHMM(e.clockIn) }}</td>
            <td>{{ formatDateTimeJST(e.detectedAt) }}</td>
            <td>
              <span
                v-if="e.resolved"
                class="badge badge-success"
              >修正済み</span>
              <span
                v-else
                class="badge badge-warning"
              >未修正</span>
            </td>
            <td class="num">
              <NuxtLink :to="{ path: `/admin/users/${e.userId}`, query: { month: monthOf(e.date) } }">
                修正する
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>検出処理の実行履歴</h2>
      <table class="data">
        <thead>
          <tr>
            <th>実行日時</th>
            <th>対象日</th>
            <th>実行方法</th>
            <th class="num">
              検出件数
            </th>
            <th class="num">
              新規
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="data.runs.length === 0">
            <td
              colspan="5"
              class="muted"
            >
              まだ実行されていません。
            </td>
          </tr>
          <tr
            v-for="r in data.runs"
            :key="r.id"
          >
            <td>{{ formatDateTimeJST(r.ranAt) }}</td>
            <td>{{ r.targetDate }}</td>
            <td>{{ r.trigger === 'schedule' ? '定期（毎日0時）' : '手動' }}</td>
            <td class="num">
              {{ r.found }}件
            </td>
            <td class="num">
              {{ r.added }}件
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
.run-card {
  margin-bottom: 8px;
}

.toolbar.run {
  margin-bottom: 0;
}

.run-card .alert {
  margin: 12px 0 0;
}
</style>
