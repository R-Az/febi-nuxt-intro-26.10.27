import type { EmployeeMonthlySummary } from '#shared/types/attendance'
import { nowInJst } from '#shared/utils/date'

// 全従業員の月次集計
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const month = parseMonth(getQuery(event).month)
  const today = nowInJst().date
  const employees = await listEmployees()
  const rows: EmployeeMonthlySummary[] = await Promise.all(
    employees.map(async user => ({ user, ...summarize(await listAttendanceByMonth(user.id, month), today) })),
  )
  return { month, rows }
})
