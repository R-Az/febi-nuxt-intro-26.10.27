// 勤怠の計算・打刻の状態遷移・修正内容のチェック。画面とサーバーの両方から使う。
import type {
  AttendanceRecord,
  BreakPeriod,
  DaySummary,
  MonthTotals,
  PunchAction,
  PunchState,
  RecordInput,
} from '../types/attendance'
import { parseHHMM } from './time'

/** 所定労働時間（8時間） */
export const STANDARD_WORK_MINUTES = 8 * 60

export const PUNCH_LABELS: Record<PunchAction, string> = {
  clock_in: '出勤',
  break_start: '休憩開始',
  break_end: '休憩終了',
  clock_out: '退勤',
}

/** 休憩時間の合計（分）。終了していない休憩は数えない */
export function calcBreakMinutes(breaks: BreakPeriod[]): number {
  let total = 0
  for (const b of breaks) {
    if (b.end !== null) total += Math.max(0, b.end - b.start)
  }
  return total
}

/**
 * 1日分の集計。
 * 実働 = 退勤 − 出勤 − 休憩、残業 = 実働 − 8時間（マイナスなら0）。
 * 退勤がない日は実働・残業を計算しない（打刻漏れ）。ただし today と同じ日付なら「勤務中」とする。
 */
export function summarizeDay(record: AttendanceRecord, today?: string): DaySummary {
  const breakMinutes = calcBreakMinutes(record.breaks)
  if (record.clockOut === null) {
    return {
      date: record.date,
      clockIn: record.clockIn,
      clockOut: null,
      breakMinutes,
      workMinutes: null,
      overtimeMinutes: null,
      status: today !== undefined && record.date === today ? 'in_progress' : 'missing',
    }
  }
  const workMinutes = Math.max(0, record.clockOut - record.clockIn - breakMinutes)
  return {
    date: record.date,
    clockIn: record.clockIn,
    clockOut: record.clockOut,
    breakMinutes,
    workMinutes,
    overtimeMinutes: Math.max(0, workMinutes - STANDARD_WORK_MINUTES),
    status: 'complete',
  }
}

/** 月の合計。打刻漏れ・勤務中の日は実働・残業の合計に入れない */
export function summarizeMonth(days: DaySummary[]): MonthTotals {
  const totals: MonthTotals = {
    workDays: 0,
    totalBreakMinutes: 0,
    totalWorkMinutes: 0,
    totalOvertimeMinutes: 0,
    missingCount: 0,
  }
  for (const day of days) {
    totals.workDays++
    totals.totalBreakMinutes += day.breakMinutes
    totals.totalWorkMinutes += day.workMinutes ?? 0
    totals.totalOvertimeMinutes += day.overtimeMinutes ?? 0
    if (day.status === 'missing') totals.missingCount++
  }
  return totals
}

export function getPunchState(record: AttendanceRecord | null): PunchState {
  if (!record) return 'not_started'
  if (record.clockOut !== null) return 'finished'
  if (record.breaks.some(b => b.end === null)) return 'on_break'
  return 'working'
}

const ALLOWED_ACTIONS: Record<PunchState, PunchAction[]> = {
  not_started: ['clock_in'],
  working: ['break_start', 'clock_out'],
  on_break: ['break_end'],
  finished: [],
}

export function getAllowedActions(state: PunchState): PunchAction[] {
  return ALLOWED_ACTIONS[state]
}

const PUNCH_REJECT_MESSAGES: Record<PunchState, string> = {
  not_started: 'まだ出勤していません。',
  working: '勤務中です。',
  on_break: '休憩中です。先に休憩終了を打刻してください。',
  finished: '本日はすでに退勤しています。',
}

export class PunchError extends Error {}

/**
 * 打刻を適用した新しい記録を返す。今の状態で押せない打刻なら PunchError を投げる。
 * 引数の record は変更しない。
 */
export function applyPunch(
  record: AttendanceRecord | null,
  action: PunchAction,
  now: { date: string, minutes: number },
  userId: string,
): AttendanceRecord {
  const state = getPunchState(record)
  if (!getAllowedActions(state).includes(action)) {
    throw new PunchError(`${PUNCH_LABELS[action]}は打刻できません。${PUNCH_REJECT_MESSAGES[state]}`)
  }
  const updatedAt = new Date().toISOString()
  if (action === 'clock_in') {
    return { userId, date: now.date, clockIn: now.minutes, clockOut: null, breaks: [], updatedAt, updatedBy: userId }
  }
  // clock_in 以外は record がある状態でしか許可されない
  const current = record!
  const breaks = current.breaks.map(b => ({ ...b }))
  let clockOut = current.clockOut
  if (action === 'break_start') {
    breaks.push({ start: now.minutes, end: null })
  }
  else if (action === 'break_end') {
    const open = breaks.find(b => b.end === null)!
    open.end = now.minutes
  }
  else {
    clockOut = now.minutes
  }
  return { ...current, breaks, clockOut, updatedAt, updatedBy: userId }
}

export type ParsedRecordInput = Pick<AttendanceRecord, 'clockIn' | 'clockOut' | 'breaks'>

/**
 * 管理者の修正内容をチェックして分に変換する。
 * エラーがあれば、画面にそのまま出せる日本語のメッセージを返す。
 */
export function parseRecordInput(input: RecordInput):
  { ok: true, value: ParsedRecordInput } | { ok: false, errors: string[] } {
  const errors: string[] = []
  const clockIn = parseHHMM(input.clockIn)
  if (clockIn === null) errors.push('出勤時刻を HH:MM の形式で入力してください。')

  let clockOut: number | null = null
  if (input.clockOut !== null && input.clockOut !== '') {
    clockOut = parseHHMM(input.clockOut)
    if (clockOut === null) errors.push('退勤時刻を HH:MM の形式で入力してください。')
  }
  if (clockIn !== null && clockOut !== null && clockOut <= clockIn) {
    errors.push('退勤時刻は出勤時刻より後にしてください。')
  }

  const breaks: BreakPeriod[] = []
  input.breaks.forEach((b, i) => {
    const label = `休憩${i + 1}`
    const start = parseHHMM(b.start)
    const end = parseHHMM(b.end)
    if (start === null || end === null) {
      errors.push(`${label}の開始・終了を HH:MM の形式で入力してください。`)
      return
    }
    if (end <= start) {
      errors.push(`${label}の終了は開始より後にしてください。`)
      return
    }
    if (clockIn !== null && start < clockIn) errors.push(`${label}が出勤時刻より前に始まっています。`)
    if (clockOut !== null && end > clockOut) errors.push(`${label}が退勤時刻より後まで続いています。`)
    breaks.push({ start, end })
  })

  const sorted = [...breaks].sort((a, b) => a.start - b.start)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i]!.start < sorted[i - 1]!.end!) {
      errors.push('休憩の時間帯が重なっています。')
      break
    }
  }

  if (errors.length > 0 || clockIn === null) return { ok: false, errors }
  return { ok: true, value: { clockIn, clockOut, breaks: sorted } }
}
