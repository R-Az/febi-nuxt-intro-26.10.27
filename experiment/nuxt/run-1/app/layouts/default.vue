<script setup lang="ts">
const { user, fetch: refreshSession } = useUserSession()

const links = computed(() => user.value?.role === 'admin'
  ? [
      { to: '/admin', label: '月次一覧' },
      { to: '/admin/missing', label: '打刻漏れ' },
      { to: '/admin/export', label: 'CSV出力' },
    ]
  : [
      { to: '/', label: '打刻' },
      { to: '/attendance', label: '勤怠一覧' },
    ])

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refreshSession()
  await navigateTo('/login')
}
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <NuxtLink
          :to="user?.role === 'admin' ? '/admin' : '/'"
          class="brand"
        >
          勤怠管理
        </NuxtLink>
        <nav class="nav">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="nav-link"
            :class="{ active: $route.path === link.to }"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div
          v-if="user"
          class="user"
        >
          <span>{{ user.name }}<span class="muted">（{{ user.role === 'admin' ? '管理者' : '従業員' }}）</span></span>
          <button
            type="button"
            class="btn btn-sm"
            @click="logout"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
    <main class="main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.header {
  background: #24292f;
  color: #fff;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.brand {
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 4px;
  flex: 1;
}

.nav-link {
  color: #d0d7de;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: var(--radius);
}

.nav-link:hover {
  color: #fff;
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user .muted {
  color: #afb8c1;
}

.main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}
</style>
