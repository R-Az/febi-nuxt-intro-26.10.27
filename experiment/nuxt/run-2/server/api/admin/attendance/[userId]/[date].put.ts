import { z } from 'zod'
import { validateAttendance } from '#shared/utils/attendance'

const optionalTime = z.string().trim().nullish().transform(v => (v ? v : null))

const bodySchema = z.object({
  clockIn: optionalTime,
  clockOut: optionalTime,
  breaks: z.array(z.object({ start: z.string().trim(), end: z.string().trim() })).default([]),
})

// 管理者による勤怠の修正。出勤を空にして休憩・退勤も空なら、その日の記録を削除する
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const userId = getRouterParam(event, 'userId')!
  const date = parseDate(getRouterParam(event, 'date'))
  await getEmployeeOrThrow(userId)

  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: '入力内容の形式が正しくありません。' })
  }
  const { clockIn, clockOut, breaks } = parsed.data

  if (clockIn === null) {
    if (clockOut !== null || breaks.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: '入力内容に誤りがあります。',
        data: { errors: ['出勤を入力してください（記録を消すときは、出勤・退勤・休憩をすべて空にします）。'] },
      })
    }
    await deleteAttendance(userId, date)
    return { deleted: true, record: null }
  }

  const errors = validateAttendance({ clockIn, clockOut, breaks })
  if (errors.length > 0) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: '入力内容に誤りがあります。', data: { errors } })
  }

  const sortedBreaks = [...breaks].sort((a, b) => a.start.localeCompare(b.start))
  const record = await saveAttendance({ userId, date, clockIn, clockOut, breaks: sortedBreaks })
  return { deleted: false, record }
})
