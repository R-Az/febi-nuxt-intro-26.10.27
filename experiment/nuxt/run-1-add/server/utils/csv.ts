// 勤怠のCSV。Excel で開いても文字化けしないよう UTF-8（BOM付き）・改行は CRLF にする。
import type { MonthlyReport } from '../../shared/types/attendance'
import { minutesToHHMM } from '../../shared/utils/time'

export const CSV_HEADER = ['従業員ID', '氏名', '日付', '出勤', '退勤', '休憩(分)', '実働(分)', '残業(分)', '備考']

function escapeCsvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

const NOTE: Record<string, string> = {
  complete: '',
  missing: '打刻漏れ',
  in_progress: '勤務中',
}

/** 勤怠がある日だけを行にする */
export function buildAttendanceCsv(reports: MonthlyReport[]): string {
  const rows: string[][] = [CSV_HEADER]
  for (const report of reports) {
    for (const day of report.days) {
      const s = day.summary
      if (!s) continue
      rows.push([
        report.user.id,
        report.user.name,
        day.date,
        minutesToHHMM(s.clockIn),
        s.clockOut === null ? '' : minutesToHHMM(s.clockOut),
        String(s.breakMinutes),
        s.workMinutes === null ? '' : String(s.workMinutes),
        s.overtimeMinutes === null ? '' : String(s.overtimeMinutes),
        NOTE[s.status] ?? '',
      ])
    }
  }
  return '﻿' + rows.map(r => r.map(escapeCsvCell).join(',')).join('\r\n') + '\r\n'
}
