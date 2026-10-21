/**
 * 勤怠のCSV出力。?month=YYYY-MM&userId=E001（userId=all または省略で全員）
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const month = getMonthQuery(event)
  const { userId } = getQuery(event)
  const all = userId === undefined || userId === '' || userId === 'all'
  const users = all ? await listUsersByRole('employee') : [await getEmployeeOr404(String(userId))]
  const reports = await Promise.all(users.map(u => buildMonthlyReport(u, month)))

  const fileName = `attendance_${month}_${all ? 'all' : users[0]!.id}.csv`
  setResponseHeaders(event, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${fileName}"`,
    'Cache-Control': 'no-store',
  })
  return buildAttendanceCsv(reports)
})
