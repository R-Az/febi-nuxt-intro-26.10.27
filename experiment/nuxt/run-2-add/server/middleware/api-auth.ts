// API 全体の入口でのチェック。
// ・ログインしていなければ 401（ログイン API と nuxt-auth-utils のセッション API を除く）
// ・/api/admin/ 以下は管理者でなければ 403
// 各 API でも同じ関数で権限を確認している（二重のチェック）。
const PUBLIC_API_PATHS = ['/api/auth/login', '/api/_auth/session']

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return
  if (PUBLIC_API_PATHS.includes(path)) return

  if (path.startsWith('/api/admin/')) {
    await requireAdmin(event)
  }
  else {
    await requireLogin(event)
  }
})
