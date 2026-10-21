import type { H3Event } from 'h3'
import type { PublicUser } from '#shared/types/attendance'

/** ログイン中のユーザー。未ログインなら 401 */
export async function requireLoginUser(event: H3Event): Promise<PublicUser> {
  const session = await getUserSession(event)
  // セッションの中身ではなく、データ層の最新のユーザー情報（役割）で判定する
  const user = session.user ? await findUserById(session.user.id) : null
  if (!user) {
    throw createError({ statusCode: 401, message: 'ログインしてください。' })
  }
  return user
}

/** 管理者のみ。未ログインなら 401、管理者でなければ 403 */
export async function requireAdmin(event: H3Event): Promise<PublicUser> {
  const user = await requireLoginUser(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'この操作は管理者のみ行えます。' })
  }
  return user
}

/** 従業員本人のみ（打刻など）。管理者も 403 */
export async function requireEmployee(event: H3Event): Promise<PublicUser> {
  const user = await requireLoginUser(event)
  if (user.role !== 'employee') {
    throw createError({ statusCode: 403, message: 'この操作は従業員のみ行えます。' })
  }
  return user
}

/** 本人か管理者のみ。それ以外は 403 */
export async function requireSelfOrAdmin(event: H3Event, userId: string): Promise<PublicUser> {
  const user = await requireLoginUser(event)
  if (user.role !== 'admin' && user.id !== userId) {
    throw createError({ statusCode: 403, message: '他の従業員のデータは見られません。' })
  }
  return user
}
