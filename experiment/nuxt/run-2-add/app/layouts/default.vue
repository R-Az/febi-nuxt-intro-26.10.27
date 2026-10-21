<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { user, clear } = useUserSession()

const links = computed<NavigationMenuItem[]>(() => user.value?.role === 'admin'
  ? [
      { to: '/admin', label: '月次一覧', icon: 'i-lucide-table', exact: true },
      { to: '/admin/missing-punches', label: '打刻漏れ', icon: 'i-lucide-alert-triangle', exact: true },
      { to: '/admin/export', label: 'CSV出力', icon: 'i-lucide-download', exact: true },
    ]
  : [
      { to: '/punch', label: '打刻', icon: 'i-lucide-clock', exact: true },
      { to: '/attendance', label: '勤怠一覧', icon: 'i-lucide-calendar', exact: true },
    ])

async function logout() {
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <div>
    <UHeader :to="homePath(user?.role)" title="勤怠管理">
      <UNavigationMenu :items="links" />

      <template #right>
        <span class="hidden text-sm sm:inline">
          {{ user?.name }}<span v-if="user?.role === 'admin'" class="text-muted">（管理者）</span>
        </span>
        <UColorModeButton />
        <UButton color="neutral" variant="ghost" icon="i-lucide-log-out" label="ログアウト" :ui="{ label: 'hidden sm:inline' }" aria-label="ログアウト" @click="logout" />
      </template>

      <template #body>
        <UNavigationMenu :items="links" orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>

    <UMain>
      <UContainer class="py-6">
        <slot />
      </UContainer>
    </UMain>
  </div>
</template>
