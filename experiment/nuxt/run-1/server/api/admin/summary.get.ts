import type { EmployeeMonthSummary } from '#shared/types/attendance'

/** 全従業員の月次集計 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const month = getMonthQuery(event)
  const employees = await listUsersByRole('employee')
  const rows: EmployeeMonthSummary[] = await Promise.all(employees.map(async (user) => {
    const report = await buildMonthlyReport(user, month)
    return { user, totals: report.totals }
  }))
  return { month, rows }
})
