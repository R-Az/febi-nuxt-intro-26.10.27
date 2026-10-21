<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'ログイン | 勤怠管理' })

const { fetch: refreshSession, user } = useUserSession()
const state = reactive({ email: '', password: '' })
const errors = ref<string[]>([])
const submitting = ref(false)

async function login() {
  submitting.value = true
  errors.value = []
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { email: state.email, password: state.password } })
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
  <div class="flex min-h-screen items-center justify-center bg-muted p-4">
    <div class="absolute top-4 right-4">
      <UColorModeButton />
    </div>
    <UCard class="w-full max-w-sm">
      <template #header>
        <h1 class="text-lg font-bold">
          勤怠管理 ログイン
        </h1>
      </template>
      <UForm
        :state="state"
        class="space-y-4"
        @submit="login"
      >
        <UAlert
          v-if="errors.length"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :description="errors.join(' ')"
          role="alert"
        />
        <UFormField
          label="メールアドレス"
          name="email"
          required
        >
          <UInput
            v-model="state.email"
            type="email"
            autocomplete="username"
            required
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="パスワード"
          name="password"
          required
        >
          <UInput
            v-model="state.password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full"
          />
        </UFormField>
        <UButton
          type="submit"
          block
          :loading="submitting"
        >
          ログイン
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
