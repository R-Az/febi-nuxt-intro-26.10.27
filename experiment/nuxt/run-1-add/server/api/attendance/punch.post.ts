import { z } from 'zod'
import { PunchError, applyPunch } from '#shared/utils/attendance'
import { tokyoNow } from '#shared/utils/time'

const bodySchema = z.object({
  action: z.enum(['clock_in', 'break_start', 'break_end', 'clock_out']),
})

/** 自分の打刻。今の状態で押せない打刻は 409 で弾く（画面と同じルール） */
export default defineEventHandler(async (event) => {
  const user = await requireEmployee(event)
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: '打刻の種類が正しくありません。' })
  }
  const now = tokyoNow()
  const current = await getRecord(user.id, now.date)
  try {
    const next = applyPunch(current, parsed.data.action, now, user.id)
    return { record: await saveRecord(next) }
  }
  catch (e) {
    if (e instanceof PunchError) throw createError({ statusCode: 409, message: e.message })
    throw e
  }
})
