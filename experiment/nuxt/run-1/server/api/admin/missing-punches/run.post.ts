import { z } from 'zod'
import type { DetectionRun } from '#shared/types/attendance'
import { isValidDateString, tokyoNow } from '#shared/utils/time'

const bodySchema = z.object({ date: z.string().refine(isValidDateString) })

/** 打刻漏れ検出を今すぐ実行する（定期処理と同じタスクを使う） */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: '対象日を YYYY-MM-DD の形式で指定してください。' })
  }
  if (parsed.data.date >= tokyoNow().date) {
    throw createError({ statusCode: 400, message: '対象日は昨日以前の日付にしてください。' })
  }
  const { result } = await runTask('attendance:detect-missing', { payload: { date: parsed.data.date } })
  return { run: result as DetectionRun }
})
