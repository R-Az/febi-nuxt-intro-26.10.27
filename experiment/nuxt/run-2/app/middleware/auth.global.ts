// ログインしていなければログイン画面へ。役割に合わない画面は、その人のトップへ戻す
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  if (to.path === '/login') {
    if (loggedIn.value) return navigateTo(homePath(user.value?.role))
    return
  }
  if (!loggedIn.value || !user.value) {
    return navigateTo('/login')
  }

  const isAdminPage = to.path === '/admin' || to.path.startsWith('/admin/')
  if (to.path === '/') return navigateTo(homePath(user.value.role))
  if (isAdminPage && user.value.role !== 'admin') return navigateTo(homePath(user.value.role))
  if (!isAdminPage && user.value.role === 'admin') return navigateTo(homePath(user.value.role))
})
