import { calcDay } from '#shared/utils/attendance'
import { nowInJst } from '#shared/utils/date'

const HEADER = ['従業員ID', '氏名', '日付', '出勤', '退勤', '休憩(分)', '実働(分)', '残業(分)', '備考']

function csvCell(value: string | number | null): string {
  const s = value === null ? '' : String(value)
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
}

// 勤怠の CSV。UTF-8（BOM付き）・改行 CRLF で、Excel でそのまま開ける
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const month = parseMonth(query.month)
  const userId = typeof query.userId === 'string' && query.userId !== '' ? query.userId : 'all'

  const employees = userId === 'all' ? await listEmployees() : [await getEmployeeOrThrow(userId)]

  const today = nowInJst().date
  const lines = [HEADER.map(csvCell).join(',')]
  for (const user of employees) {
    for (const record of await listAttendanceByMonth(user.id, month)) {
      const day = calcDay(record, today)
      lines.push([
        user.id,
        user.name,
        record.date,
        record.clockIn,
        record.clockOut,
        day.breakMinutes,
        day.workMinutes,
        day.overtimeMinutes,
        day.missingClockOut ? '打刻漏れ' : day.inProgress ? '勤務中' : '',
      ].map(csvCell).join(','))
    }
  }

  const filename = `attendance_${month}_${userId}.csv`
  setResponseHeaders(event, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-store',
  })
  return `﻿${lines.join('\r\n')}\r\n`
})
