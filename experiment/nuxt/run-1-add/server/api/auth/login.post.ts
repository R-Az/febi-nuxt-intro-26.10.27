import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(200),
})

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'メールアドレスとパスワードを入力してください。' })
  }
  const user = await verifyCredentials(parsed.data.email, parsed.data.password)
  if (!user) {
    throw createError({ statusCode: 401, message: 'メールアドレスまたはパスワードが正しくありません。' })
  }
  await replaceUserSession(event, { user, loggedInAt: new Date().toISOString() })
  return { user }
})
