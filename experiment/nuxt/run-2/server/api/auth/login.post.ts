import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'メールアドレスとパスワードを入力してください。' })
  }
  const { email, password } = parsed.data

  const user = await findUserByEmail(email)
  // ユーザーがいない場合も同じメッセージにする
  if (!user || !(await verifyPassword(user.passwordHash, password))) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'メールアドレスまたはパスワードが違います。' })
  }

  const publicUser = toPublicUser(user)
  await replaceUserSession(event, { user: publicUser, loggedInAt: new Date().toISOString() })
  return publicUser
})
