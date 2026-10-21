import { describe, expect, it } from 'vitest'
import type { AttendanceRecord, BreakPeriod } from '../../shared/types/attendance'
import {
  applyPunch,
  calcBreakMinutes,
  getAllowedActions,
  getPunchState,
  parseRecordInput,
  PunchError,
  summarizeDay,
  summarizeMonth,
} from '../../shared/utils/attendance'

const t = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h! * 60 + m!
}

function record(clockIn: string, clockOut: string | null, breaks: [string, string | null][] = [], date = '2026-10-01'): AttendanceRecord {
  return {
    userId: 'E001',
    date,
    clockIn: t(clockIn),
    clockOut: clockOut === null ? null : t(clockOut),
    breaks: breaks.map(([s, e]): BreakPeriod => ({ start: t(s), end: e === null ? null : t(e) })),
    updatedAt: '2026-10-01T00:00:00.000Z',
    updatedBy: 'E001',
  }
}

describe('勤怠の計算ルール（受け入れ条件4）', () => {
  it('実働 = 退勤 − 出勤 − 休憩', () => {
    const s = summarizeDay(record('09:00', '17:30', [['12:00', '13:00']]))
    expect(s.breakMinutes).toBe(60)
    expect(s.workMinutes).toBe(7 * 60 + 30)
    expect(s.status).toBe('complete')
  })

  it('実働が8時間未満なら残業は0（マイナスにしない）', () => {
    const s = summarizeDay(record('09:00', '17:30', [['12:00', '13:00']]))
    expect(s.overtimeMinutes).toBe(0)
  })

  it('実働がちょうど8時間なら残業は0', () => {
    const s = summarizeDay(record('09:00', '18:00', [['12:00', '13:00']]))
    expect(s.workMinutes).toBe(480)
    expect(s.overtimeMinutes).toBe(0)
  })

  it('残業 = 実働 − 8時間', () => {
    const s = summarizeDay(record('09:00', '20:15', [['12:00', '13:00']]))
    expect(s.workMinutes).toBe(10 * 60 + 15)
    expect(s.overtimeMinutes).toBe(2 * 60 + 15)
  })

  it('休憩が複数あれば合計して差し引く', () => {
    const s = summarizeDay(record('08:45', '19:00', [['12:00', '12:45'], ['15:00', '15:15']]))
    expect(s.breakMinutes).toBe(60)
    expect(s.workMinutes).toBe(9 * 60 + 15)
    expect(s.overtimeMinutes).toBe(75)
  })

  it('休憩がなければ 退勤 − 出勤 がそのまま実働になる', () => {
    const s = summarizeDay(record('10:00', '14:01'))
    expect(s.breakMinutes).toBe(0)
    expect(s.workMinutes).toBe(241)
    expect(s.overtimeMinutes).toBe(0)
  })

  it('退勤がない日は実働・残業を計算せず「打刻漏れ」にする', () => {
    const s = summarizeDay(record('09:00', null, [['12:00', '13:00']]), '2026-10-19')
    expect(s.status).toBe('missing')
    expect(s.workMinutes).toBeNull()
    expect(s.overtimeMinutes).toBeNull()
    expect(s.breakMinutes).toBe(60)
  })

  it('today を渡さなければ、退勤がない日はすべて打刻漏れ', () => {
    expect(summarizeDay(record('09:00', null)).status).toBe('missing')
  })

  it('今日の分で退勤がまだなら「勤務中」とし、実働・残業は計算しない', () => {
    const s = summarizeDay(record('09:00', null, [], '2026-10-19'), '2026-10-19')
    expect(s.status).toBe('in_progress')
    expect(s.workMinutes).toBeNull()
    expect(s.overtimeMinutes).toBeNull()
  })

  it('終わっていない休憩は休憩時間に数えない', () => {
    expect(calcBreakMinutes([{ start: t('12:00'), end: t('12:30') }, { start: t('15:00'), end: null }])).toBe(30)
  })

  it('実働が負になるデータでも 0 にとどめる', () => {
    const s = summarizeDay(record('09:00', '09:30', [['09:00', '10:00']]))
    expect(s.workMinutes).toBe(0)
    expect(s.overtimeMinutes).toBe(0)
  })
})

describe('月の合計', () => {
  it('打刻漏れの日は出勤日数に入れ、実働・残業の合計には入れない', () => {
    const totals = summarizeMonth([
      summarizeDay(record('09:00', '18:00', [['12:00', '13:00']], '2026-10-01')), // 実働 8:00 残業 0
      summarizeDay(record('09:00', '20:00', [['12:00', '13:00']], '2026-10-02')), // 実働 10:00 残業 2:00
      summarizeDay(record('09:00', null, [['12:00', '13:00']], '2026-10-05')), // 打刻漏れ
    ])
    expect(totals).toEqual({
      workDays: 3,
      totalBreakMinutes: 180,
      totalWorkMinutes: 18 * 60,
      totalOvertimeMinutes: 120,
      missingCount: 1,
    })
  })

  it('勤務中の日は打刻漏れの件数に入れない', () => {
    const totals = summarizeMonth([summarizeDay(record('09:00', null, [], '2026-10-19'), '2026-10-19')])
    expect(totals.missingCount).toBe(0)
    expect(totals.workDays).toBe(1)
  })

  it('勤怠がなければすべて0', () => {
    expect(summarizeMonth([])).toEqual({ workDays: 0, totalBreakMinutes: 0, totalWorkMinutes: 0, totalOvertimeMinutes: 0, missingCount: 0 })
  })
})

describe('打刻の状態遷移（受け入れ条件2）', () => {
  const at = (hhmm: string) => ({ date: '2026-10-19', minutes: t(hhmm) })

  it('出勤 → 休憩開始 → 休憩終了 → 退勤 の順に打刻できる', () => {
    let r = applyPunch(null, 'clock_in', at('09:00'), 'E001')
    expect(getPunchState(r)).toBe('working')
    r = applyPunch(r, 'break_start', at('12:00'), 'E001')
    expect(getPunchState(r)).toBe('on_break')
    r = applyPunch(r, 'break_end', at('13:00'), 'E001')
    expect(getPunchState(r)).toBe('working')
    r = applyPunch(r, 'clock_out', at('18:30'), 'E001')
    expect(getPunchState(r)).toBe('finished')
    expect(summarizeDay(r).workMinutes).toBe(8 * 60 + 30)
  })

  it('状態ごとに押せるボタン', () => {
    expect(getAllowedActions('not_started')).toEqual(['clock_in'])
    expect(getAllowedActions('working')).toEqual(['break_start', 'clock_out'])
    expect(getAllowedActions('on_break')).toEqual(['break_end'])
    expect(getAllowedActions('finished')).toEqual([])
  })

  it('出勤前の退勤・二重の出勤・休憩中の退勤・退勤後の打刻は弾く', () => {
    const working = applyPunch(null, 'clock_in', at('09:00'), 'E001')
    const onBreak = applyPunch(working, 'break_start', at('12:00'), 'E001')
    const finished = applyPunch(working, 'clock_out', at('18:00'), 'E001')
    expect(() => applyPunch(null, 'clock_out', at('09:00'), 'E001')).toThrow(PunchError)
    expect(() => applyPunch(null, 'break_start', at('09:00'), 'E001')).toThrow(PunchError)
    expect(() => applyPunch(working, 'clock_in', at('09:05'), 'E001')).toThrow(PunchError)
    expect(() => applyPunch(working, 'break_end', at('09:05'), 'E001')).toThrow(PunchError)
    expect(() => applyPunch(onBreak, 'clock_out', at('12:10'), 'E001')).toThrow(PunchError)
    expect(() => applyPunch(onBreak, 'break_start', at('12:10'), 'E001')).toThrow(PunchError)
    expect(() => applyPunch(finished, 'clock_in', at('18:10'), 'E001')).toThrow(PunchError)
  })

  it('元の記録は書き換えない', () => {
    const working = applyPunch(null, 'clock_in', at('09:00'), 'E001')
    applyPunch(working, 'break_start', at('12:00'), 'E001')
    expect(working.breaks).toEqual([])
  })
})

describe('管理者の修正内容のチェック（受け入れ条件6）', () => {
  it('正しい入力は分に変換し、休憩を開始時刻順に並べる', () => {
    const r = parseRecordInput({ clockIn: '09:00', clockOut: '18:00', breaks: [{ start: '15:00', end: '15:10' }, { start: '12:00', end: '13:00' }] })
    expect(r).toEqual({ ok: true, value: { clockIn: 540, clockOut: 1080, breaks: [{ start: 720, end: 780 }, { start: 900, end: 910 }] } })
  })

  it('退勤は空欄でもよい（打刻漏れのまま）', () => {
    expect(parseRecordInput({ clockIn: '09:00', clockOut: null, breaks: [] })).toEqual({ ok: true, value: { clockIn: 540, clockOut: null, breaks: [] } })
    expect(parseRecordInput({ clockIn: '09:00', clockOut: '', breaks: [] }).ok).toBe(true)
  })

  it('退勤が出勤より前・同時なら弾く', () => {
    expect(parseRecordInput({ clockIn: '09:00', clockOut: '08:59', breaks: [] })).toEqual({ ok: false, errors: ['退勤時刻は出勤時刻より後にしてください。'] })
    expect(parseRecordInput({ clockIn: '09:00', clockOut: '09:00', breaks: [] }).ok).toBe(false)
  })

  it('休憩の終了が開始より前、勤務時間の外、重なりは弾く', () => {
    expect(parseRecordInput({ clockIn: '09:00', clockOut: '18:00', breaks: [{ start: '13:00', end: '12:00' }] }).ok).toBe(false)
    expect(parseRecordInput({ clockIn: '09:00', clockOut: '18:00', breaks: [{ start: '08:00', end: '09:30' }] }).ok).toBe(false)
    expect(parseRecordInput({ clockIn: '09:00', clockOut: '18:00', breaks: [{ start: '17:30', end: '18:30' }] }).ok).toBe(false)
    expect(parseRecordInput({ clockIn: '09:00', clockOut: '18:00', breaks: [{ start: '12:00', end: '13:00' }, { start: '12:30', end: '13:30' }] }).ok).toBe(false)
  })

  it('時刻の形式が不正なら弾く', () => {
    expect(parseRecordInput({ clockIn: '9:00', clockOut: '18:00', breaks: [] }).ok).toBe(false)
    expect(parseRecordInput({ clockIn: '09:00', clockOut: '24:00', breaks: [] }).ok).toBe(false)
    expect(parseRecordInput({ clockIn: '09:00', clockOut: '18:00', breaks: [{ start: '', end: '13:00' }] }).ok).toBe(false)
  })
})
