<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { user, fetch: refreshSession } = useUserSession()
const route = useRoute()
const { setConsent } = useAnalyticsConsent()

const links = computed<NavigationMenuItem[]>(() => {
  const items = user.value?.role === 'admin'
    ? [
        { to: '/admin', label: '月次一覧', icon: 'i-lucide-table' },
        { to: '/admin/missing', label: '打刻漏れ', icon: 'i-lucide-triangle-alert' },
        { to: '/admin/export', label: 'CSV出力', icon: 'i-lucide-download' },
      ]
    : [
        { to: '/', label: '打刻', icon: 'i-lucide-clock' },
        { to: '/attendance', label: '勤怠一覧', icon: 'i-lucide-calendar-days' },
      ]
  // 子の画面（/admin/users/:id）でも「月次一覧」を選択中にしないよう、URLの完全一致で選択中を決める
  return items.map(item => ({ ...item, active: route.path === item.to }))
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refreshSession()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-muted">
    <UHeader
      :to="user?.role === 'admin' ? '/admin' : '/'"
      title="勤怠管理"
    >
      <UNavigationMenu
        :items="links"
        variant="link"
      />

      <template #right>
        <span
          v-if="user"
          class="hidden text-sm sm:inline"
        >
          {{ user.name }}<span class="text-muted">（{{ user.role === 'admin' ? '管理者' : '従業員' }}）</span>
        </span>
        <UColorModeButton />
        <UButton
          v-if="user"
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-log-out"
          @click="logout"
        >
          ログアウト
        </UButton>
      </template>

      <template #body>
        <UNavigationMenu
          :items="links"
          orientation="vertical"
          class="-mx-2.5"
        />
      </template>
    </UHeader>

    <UMain>
      <UContainer class="py-6">
        <slot />
      </UContainer>
    </UMain>

    <footer class="pb-6 text-center">
      <UButton
        color="neutral"
        variant="link"
        size="xs"
        @click="setConsent(null)"
      >
        アクセス解析の設定
      </UButton>
    </footer>
  </div>
</template>
