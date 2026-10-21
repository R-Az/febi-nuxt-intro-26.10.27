import type { MonthlyReport } from '#shared/types/attendance'

/** 従業員の月次勤怠。本人と管理者だけが見られる */
export default defineEventHandler(async (event): Promise<MonthlyReport> => {
  const userId = getRouterParam(event, 'userId') ?? ''
  await requireSelfOrAdmin(event, userId)
  const month = getMonthQuery(event)
  return buildMonthlyReport(await getEmployeeOr404(userId), month)
})
