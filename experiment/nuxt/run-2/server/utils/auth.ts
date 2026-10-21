import type { H3Event } from 'h3'
import type { User } from '#auth-utils'

/** ログインしていなければ 401 */
export async function requireLogin(event: H3Event): Promise<User> {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'ログインしてください。' })
  }
  return session.user
}

/** 管理者でなければ 403 */
export async function requireAdmin(event: H3Event): Promise<User> {
  const user = await requireLogin(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden', message: 'この操作は管理者だけができます。' })
  }
  return user
}

/** 従業員でなければ 403（打刻は従業員だけ） */
export async function requireEmployee(event: H3Event): Promise<User> {
  const user = await requireLogin(event)
  if (user.role !== 'employee') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden', message: 'この操作は従業員だけができます。' })
  }
  return user
}

/** 本人か管理者でなければ 403 */
export async function requireSelfOrAdmin(event: H3Event, userId: string): Promise<User> {
  const user = await requireLogin(event)
  if (user.role !== 'admin' && user.id !== userId) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden', message: '他の従業員のデータは見られません。' })
  }
  return user
}
