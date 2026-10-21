import { z } from 'zod'

const bodySchema = z.object({
  action: z.enum(['clockIn', 'breakStart', 'breakEnd', 'clockOut']),
})

export default defineEventHandler(async (event) => {
  const user = await requireEmployee(event)
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: '打刻の種類が正しくありません。' })
  }
  return punch(user.id, parsed.data.action)
})
