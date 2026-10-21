// 画面の出し分け。未ログインならログイン画面へ。管理者画面は管理者だけ、打刻・自分の勤怠は従業員だけ。
// （データは API 側でも権限を確認している）
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()
  const home = user.value?.role === 'admin' ? '/admin' : '/'

  if (to.path === '/login') {
    return loggedIn.value ? navigateTo(home) : undefined
  }
  if (!loggedIn.value || !user.value) {
    return navigateTo('/login')
  }
  const isAdminPage = to.path === '/admin' || to.path.startsWith('/admin/')
  if (isAdminPage !== (user.value.role === 'admin')) {
    return navigateTo(home)
  }
})
