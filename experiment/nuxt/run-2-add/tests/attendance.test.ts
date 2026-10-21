import { describe, expect, it } from 'vitest'
import {
  allowedActions,
  calcBreakMinutes,
  calcDay,
  getPunchState,
  STANDARD_WORK_MINUTES,
  summarize,
  validateAttendance,
} from '../shared/utils/attendance'
import type { AttendanceRecord } from '../shared/types/attendance'

const record = (overrides: Partial<AttendanceRecord> = {}): AttendanceRecord => ({
  userId: 'E001',
  date: '2026-10-01',
  clockIn: '09:00',
  clockOut: '18:00',
  breaks: [{ start: '12:00', end: '13:00' }],
  ...overrides,
})

describe('calcDay: 実働 = 退勤 − 出勤 − 休憩、残業 = 実働 − 8時間', () => {
  it('9:00〜18:00、休憩60分なら実働8時間・残業0', () => {
    expect(calcDay(record())).toEqual({ breakMinutes: 60, workMinutes: 480, overtimeMinutes: 0, missingClockOut: false, inProgress: false })
  })

  it('8時間を超えた分が残業になる', () => {
    const day = calcDay(record({ clockOut: '20:30' }))
    expect(day.workMinutes).toBe(630)
    expect(day.overtimeMinutes).toBe(150)
  })

  it('ちょうど8時間なら残業0、1分超えると残業1分', () => {
    expect(calcDay(record({ clockIn: '09:00', clockOut: '17:00', breaks: [] })).overtimeMinutes).toBe(0)
    expect(calcDay(record({ clockIn: '09:00', clockOut: '17:01', breaks: [] })).overtimeMinutes).toBe(1)
  })

  it('実働が8時間未満なら残業はマイナスにならず0', () => {
    const day = calcDay(record({ clockIn: '09:00', clockOut: '13:00', breaks: [] }))
    expect(day.workMinutes).toBe(240)
    expect(day.overtimeMinutes).toBe(0)
  })

  it('休憩が複数回あれば合計を引く', () => {
    const day = calcDay(record({
      clockIn: '08:50',
      clockOut: '19:10',
      breaks: [{ start: '12:00', end: '12:45' }, { start: '15:00', end: '15:15' }],
    }))
    expect(day.breakMinutes).toBe(60)
    expect(day.workMinutes).toBe(560)
    expect(day.overtimeMinutes).toBe(80)
  })

  it('休憩なしでも計算できる（分単位）', () => {
    const day = calcDay(record({ clockIn: '09:07', clockOut: '18:23', breaks: [] }))
    expect(day.workMinutes).toBe(556)
    expect(day.overtimeMinutes).toBe(76)
  })

  it('退勤がない日は実働・残業を計算せず打刻漏れにする', () => {
    expect(calcDay(record({ clockOut: null }))).toEqual({
      breakMinutes: 60,
      workMinutes: null,
      overtimeMinutes: null,
      missingClockOut: true,
      inProgress: false,
    })
  })

  it('今日の分でまだ退勤していなければ、打刻漏れではなく勤務中', () => {
    const day = calcDay(record({ date: '2026-10-20', clockOut: null }), '2026-10-20')
    expect(day.missingClockOut).toBe(false)
    expect(day.inProgress).toBe(true)
    expect(day.workMinutes).toBeNull()
    // 前日以前の分は打刻漏れ
    expect(calcDay(record({ date: '2026-10-19', clockOut: null }), '2026-10-20').missingClockOut).toBe(true)
  })

  it('所定労働時間は8時間（480分）', () => {
    expect(STANDARD_WORK_MINUTES).toBe(480)
  })
})

describe('calcBreakMinutes', () => {
  it('終わっていない休憩は数えない', () => {
    expect(calcBreakMinutes([{ start: '12:00', end: '13:00' }, { start: '15:00', end: null }])).toBe(60)
  })
})

describe('summarize: 月の合計', () => {
  it('打刻漏れの日は出勤日数に含め、実働・残業の合計には含めない', () => {
    const totals = summarize([
      record({ date: '2026-10-01', clockOut: '18:00' }), // 実働480 残業0
      record({ date: '2026-10-02', clockOut: '19:30' }), // 実働570 残業90
      record({ date: '2026-10-05', clockOut: null }), // 打刻漏れ
    ])
    expect(totals).toEqual({ workDays: 3, workMinutes: 1050, overtimeMinutes: 90, missingCount: 1 })
  })

  it('勤務中の今日は打刻漏れに数えない', () => {
    const totals = summarize([
      record({ date: '2026-10-19', clockOut: '18:00' }),
      record({ date: '2026-10-20', clockOut: null }),
    ], '2026-10-20')
    expect(totals).toEqual({ workDays: 2, workMinutes: 480, overtimeMinutes: 0, missingCount: 0 })
  })

  it('記録がなければすべて0', () => {
    expect(summarize([])).toEqual({ workDays: 0, workMinutes: 0, overtimeMinutes: 0, missingCount: 0 })
  })
})

describe('打刻の状態と押せるボタン', () => {
  it('出勤前は出勤だけ押せる', () => {
    const state = getPunchState(null)
    expect(state).toBe('notStarted')
    expect(allowedActions(state)).toEqual(['clockIn'])
  })

  it('勤務中は休憩開始と退勤が押せる（二重の出勤はできない）', () => {
    const state = getPunchState(record({ clockOut: null, breaks: [] }))
    expect(state).toBe('working')
    expect(allowedActions(state)).toEqual(['breakStart', 'clockOut'])
  })

  it('休憩中は休憩終了だけ押せる', () => {
    const state = getPunchState(record({ clockOut: null, breaks: [{ start: '12:00', end: null }] }))
    expect(state).toBe('onBreak')
    expect(allowedActions(state)).toEqual(['breakEnd'])
  })

  it('退勤後は何も押せない', () => {
    const state = getPunchState(record())
    expect(state).toBe('finished')
    expect(allowedActions(state)).toEqual([])
  })
})

describe('validateAttendance: 管理者の修正内容の検査', () => {
  it('正しい内容ならエラーなし', () => {
    expect(validateAttendance({ clockIn: '09:00', clockOut: '18:00', breaks: [{ start: '12:00', end: '13:00' }] })).toEqual([])
  })

  it('退勤が出勤より前ならエラー', () => {
    expect(validateAttendance({ clockIn: '18:00', clockOut: '09:00', breaks: [] })).toContain('退勤は出勤より後の時刻にしてください。')
  })

  it('退勤なし（打刻漏れのまま）は許す', () => {
    expect(validateAttendance({ clockIn: '09:00', clockOut: null, breaks: [] })).toEqual([])
  })

  it('勤務時間の外にある休憩や、重なる休憩はエラー', () => {
    expect(validateAttendance({ clockIn: '09:00', clockOut: '18:00', breaks: [{ start: '08:00', end: '08:30' }] })).not.toEqual([])
    expect(validateAttendance({ clockIn: '09:00', clockOut: '18:00', breaks: [{ start: '17:30', end: '18:30' }] })).not.toEqual([])
    expect(validateAttendance({
      clockIn: '09:00',
      clockOut: '18:00',
      breaks: [{ start: '12:00', end: '13:00' }, { start: '12:30', end: '13:30' }],
    })).not.toEqual([])
  })

  it('時刻の形式が正しくなければエラー', () => {
    expect(validateAttendance({ clockIn: '9時', clockOut: '18:00', breaks: [] })).toEqual(['時刻は HH:MM の形式で入力してください。'])
  })
})
