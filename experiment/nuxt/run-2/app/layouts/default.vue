<script setup lang="ts">
const { user, clear } = useUserSession()

const links = computed(() => user.value?.role === 'admin'
  ? [
      { to: '/admin', label: '月次一覧' },
      { to: '/admin/missing-punches', label: '打刻漏れ' },
      { to: '/admin/export', label: 'CSV出力' },
    ]
  : [
      { to: '/punch', label: '打刻' },
      { to: '/attendance', label: '勤怠一覧' },
    ])

async function logout() {
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <NuxtLink :to="homePath(user?.role)" class="brand">勤怠管理</NuxtLink>
        <nav class="nav">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="nav-link" :exact-active-class="'active'">
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="user">
          <span>{{ user?.name }}<small v-if="user?.role === 'admin'">（管理者）</small></span>
          <button type="button" class="btn btn-ghost" @click="logout">ログアウト</button>
        </div>
      </div>
    </header>
    <main class="main">
      <slot />
    </main>
  </div>
</template>
