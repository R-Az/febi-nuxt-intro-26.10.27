<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'ログイン | 勤怠管理' })

const { fetch: refreshSession, user } = useUserSession()
const email = ref('')
const password = ref('')
const errors = ref<string[]>([])
const submitting = ref(false)

async function login() {
  submitting.value = true
  errors.value = []
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { email: email.value, password: password.value } })
    await refreshSession()
    await navigateTo(user.value?.role === 'admin' ? '/admin' : '/')
  }
  catch (e) {
    errors.value = getErrorMessages(e)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <form
      class="card login-card"
      @submit.prevent="login"
    >
      <h1>勤怠管理 ログイン</h1>
      <div
        v-if="errors.length"
        class="alert alert-error"
        role="alert"
      >
        {{ errors.join(' ') }}
      </div>
      <div class="field">
        <label for="email">メールアドレス</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="username"
          required
        >
      </div>
      <div class="field">
        <label for="password">パスワード</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        >
      </div>
      <button
        type="submit"
        class="btn btn-primary submit"
        :disabled="submitting"
      >
        ログイン
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 360px;
}

.submit {
  width: 100%;
  padding: 8px;
}
</style>
