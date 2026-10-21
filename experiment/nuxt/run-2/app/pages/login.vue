<script setup lang="ts">
definePageMeta({ layout: 'blank' })
useHead({ title: 'ログイン | 勤怠管理' })

const { fetch: refreshSession, user } = useUserSession()

const email = ref('')
const password = ref('')
const errors = ref<string[]>([])
const submitting = ref(false)

async function login() {
  errors.value = []
  submitting.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { email: email.value, password: password.value } })
    await refreshSession()
    await navigateTo(homePath(user.value?.role))
  }
  catch (e) {
    errors.value = errorMessages(e, 'ログインに失敗しました。')
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-card card">
    <h1>勤怠管理</h1>
    <p class="muted">メールアドレスとパスワードでログインしてください。</p>
    <form class="form" @submit.prevent="login">
      <label class="field">
        <span>メールアドレス</span>
        <input v-model="email" type="email" autocomplete="username" required>
      </label>
      <label class="field">
        <span>パスワード</span>
        <input v-model="password" type="password" autocomplete="current-password" required>
      </label>
      <ErrorList :messages="errors" />
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'ログイン中…' : 'ログイン' }}
      </button>
    </form>
  </div>
</template>
