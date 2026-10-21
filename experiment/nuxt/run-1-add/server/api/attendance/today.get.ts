import type { TodayStatus } from '#shared/types/attendance'
import { getAllowedActions, getPunchState, summarizeDay } from '#shared/utils/attendance'
import { tokyoNow } from '#shared/utils/time'

/** 自分の今日の打刻状況 */
export default defineEventHandler(async (event): Promise<TodayStatus> => {
  const user = await requireEmployee(event)
  const { date } = tokyoNow()
  const record = await getRecord(user.id, date)
  const state = getPunchState(record)
  return {
    date,
    record,
    state,
    allowedActions: getAllowedActions(state),
    summary: record ? summarizeDay(record, date) : null,
  }
})
