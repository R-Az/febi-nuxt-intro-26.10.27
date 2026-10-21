import { describe, expect, it } from 'vitest'
import { summarizeDay, summarizeMonth } from '../../shared/utils/attendance'
import { addDays, datesInMonth, formatDuration, isValidDateString, minutesToHHMM, parseHHMM, shiftMonth, tokyoNow } from '../../shared/utils/time'
import type { AttendanceRecord, MonthlyReport } from '../../shared/types/attendance'
import { buildAttendanceCsv } from '../../server/utils/csv'

describe('時刻のユーティリティ', () => {
  it('日本時間で今日の日付と分を求める', () => {
    // 2026-10-18T15:30:59Z = 2026-10-19 00:30:59 JST
    expect(tokyoNow(new Date('2026-10-18T15:30:59Z'))).toEqual({ date: '2026-10-19', minutes: 30 })
  })

  it('HH:MM と分の相互変換', () => {
    expect(minutesToHHMM(545)).toBe('09:05')
    expect(parseHHMM('09:05')).toBe(545)
    expect(parseHHMM('23:59')).toBe(1439)
    expect(parseHHMM('24:00')).toBeNull()
    expect(formatDuration(605)).toBe('10:05')
    expect(formatDuration(null)).toBe('—')
  })

  it('日付の計算', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(datesInMonth('2026-02')).toHaveLength(28)
    expect(isValidDateString('2026-02-30')).toBe(false)
  })
})

describe('CSV出力（受け入れ条件7）', () => {
  const rec = (date: string, clockOut: number | null): AttendanceRecord => ({
    userId: 'E001', date, clockIn: 540, clockOut, breaks: [{ start: 720, end: 780 }], updatedAt: '', updatedBy: 'E001',
  })
  const days = [
    { date: '2026-10-01', record: rec('2026-10-01', 1200), summary: summarizeDay(rec('2026-10-01', 1200), '2026-10-19') },
    { date: '2026-10-02', record: rec('2026-10-02', null), summary: summarizeDay(rec('2026-10-02', null), '2026-10-19') },
    { date: '2026-10-03', record: null, summary: null },
  ]
  const report: MonthlyReport = {
    user: { id: 'E001', name: '鈴木 一郎', email: 'suzuki@example.com', role: 'employee' },
    month: '2026-10',
    today: '2026-10-19',
    days,
    totals: summarizeMonth(days.flatMap(d => (d.summary ? [d.summary] : []))),
  }

  it('BOM付き・CRLF・指定の列で、打刻漏れは実働・残業を空欄にして備考に入れる', () => {
    const csv = buildAttendanceCsv([report])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv.slice(1).split('\r\n')).toEqual([
      '従業員ID,氏名,日付,出勤,退勤,休憩(分),実働(分),残業(分),備考',
      'E001,鈴木 一郎,2026-10-01,09:00,20:00,60,600,120,',
      'E001,鈴木 一郎,2026-10-02,09:00,,60,,,打刻漏れ',
      '',
    ])
  })
})
