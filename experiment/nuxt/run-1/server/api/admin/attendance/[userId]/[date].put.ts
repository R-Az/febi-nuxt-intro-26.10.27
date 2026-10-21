import { z } from 'zod'
import { parseRecordInput } from '#shared/utils/attendance'
import { tokyoNow } from '#shared/utils/time'

const timeString = z.string().max(5)
const bodySchema = z.object({
  clockIn: timeString,
  clockOut: timeString.nullable(),
  breaks: z.array(z.object({ start: timeString, end: timeString })).max(10),
})

/** 管理者による勤怠の修正（その日の記録がなければ新しく作る） */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const user = await getEmployeeOr404(getRouterParam(event, 'userId') ?? '')
  const date = assertDate(getRouterParam(event, 'date'))
  if (date > tokyoNow().date) {
    throw createError({ statusCode: 400, message: '未来の日付の勤怠は登録できません。', data: { errors: ['未来の日付の勤怠は登録できません。'] } })
  }

  const body = bodySchema.safeParse(await readBody(event))
  if (!body.success) {
    throw createError({ statusCode: 400, message: '入力内容の形式が正しくありません。', data: { errors: ['入力内容の形式が正しくありません。'] } })
  }
  const parsed = parseRecordInput(body.data)
  if (!parsed.ok) {
    throw createError({ statusCode: 400, message: parsed.errors.join(' '), data: { errors: parsed.errors } })
  }

  const record = await saveRecord({
    userId: user.id,
    date,
    ...parsed.value,
    updatedAt: new Date().toISOString(),
    updatedBy: admin.id,
  })
  return { record }
})
