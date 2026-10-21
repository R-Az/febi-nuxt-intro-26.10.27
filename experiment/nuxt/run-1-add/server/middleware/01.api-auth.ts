// API の入口でまとめて権限を確認する（各ハンドラーでも改めて確認している）。
// - ログイン API 以外の /api/** は、未ログインなら 401
// - /api/admin/** は、管理者でなければ 403
const PUBLIC_API = ['/api/auth/login', '/api/_auth/session']

export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0]!
  if (!path.startsWith('/api/') || PUBLIC_API.includes(path)) return
  if (path.startsWith('/api/admin/')) await requireAdmin(event)
  else await requireLoginUser(event)
})
