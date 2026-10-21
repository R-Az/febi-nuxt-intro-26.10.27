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
  <UCard class="w-full max-w-sm">
    <template #header>
      <h1 class="text-center text-xl font-bold">
        勤怠管理
      </h1>
      <p class="mt-1 text-center text-sm text-muted">
        メールアドレスとパスワードでログインしてください。
      </p>
    </template>
    <form class="flex flex-col gap-4" @submit.prevent="login">
      <UFormField label="メールアドレス" name="email" required>
        <UInput v-model="email" type="email" autocomplete="username" required class="w-full" />
      </UFormField>
      <UFormField label="パスワード" name="password" required>
        <UInput v-model="password" type="password" autocomplete="current-password" required class="w-full" />
      </UFormField>
      <ErrorList :messages="errors" />
      <UButton type="submit" block :loading="submitting" :label="submitting ? 'ログイン中…' : 'ログイン'" />
    </form>
  </UCard>
</template>
