import type {
  AttendanceRecord,
  BreakPeriod,
  DayCalculation,
  MonthTotals,
  PunchAction,
  PunchState,
} from '../types/attendance'

/** 所定労働時間（分）。これを超えた分が残業 */
export const STANDARD_WORK_MINUTES = 8 * 60

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidTime(value: string): boolean {
  return TIME_PATTERN.test(value)
}

/** 'HH:MM' を 0:00 からの分数にする */
export function toMinutes(time: string): number {
  if (!isValidTime(time)) {
    throw new Error(`時刻の形式が正しくありません: ${time}`)
  }
  const [h, m] = time.split(':').map(Number)
  return h! * 60 + m!
}

/** 分数を 'HH:MM' にする */
export function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** 時間の長さ（分）を画面表示用の 'H:MM' にする */
export function formatDuration(minutes: number | null): string {
  if (minutes === null) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

/** 休憩時間の合計（分）。終了していない休憩は数えない */
export function calcBreakMinutes(breaks: BreakPeriod[]): number {
  return breaks.reduce((sum, b) => {
    if (b.end === null) return sum
    return sum + (toMinutes(b.end) - toMinutes(b.start))
  }, 0)
}

export type DayInput = Pick<AttendanceRecord, 'clockIn' | 'clockOut' | 'breaks'> & { date?: string }

/**
 * 1日分の実働・残業を計算する。
 * - 実働 = 退勤 − 出勤 − 休憩
 * - 残業 = 実働 − 8時間（マイナスなら 0）
 * - 退勤がない日は計算せず、打刻漏れとして扱う
 *   ただし today（'YYYY-MM-DD'）を渡したとき、その日の分はまだ勤務中なので打刻漏れにしない
 */
export function calcDay(record: DayInput, today?: string): DayCalculation {
  const breakMinutes = calcBreakMinutes(record.breaks)
  if (record.clockOut === null) {
    const inProgress = today !== undefined && record.date === today
    return { breakMinutes, workMinutes: null, overtimeMinutes: null, missingClockOut: !inProgress, inProgress }
  }
  const workMinutes = Math.max(0, toMinutes(record.clockOut) - toMinutes(record.clockIn) - breakMinutes)
  const overtimeMinutes = Math.max(0, workMinutes - STANDARD_WORK_MINUTES)
  return { breakMinutes, workMinutes, overtimeMinutes, missingClockOut: false, inProgress: false }
}

/**
 * 月の合計を出す。
 * 出勤日数には打刻漏れの日・勤務中の今日も含める（出勤はしているため）。
 * 実働・残業の合計には、退勤がない日を含めない。
 */
export function summarize(records: DayInput[], today?: string): MonthTotals {
  const totals: MonthTotals = { workDays: 0, workMinutes: 0, overtimeMinutes: 0, missingCount: 0 }
  for (const record of records) {
    const day = calcDay(record, today)
    totals.workDays += 1
    if (day.missingClockOut) totals.missingCount += 1
    if (day.workMinutes !== null) {
      totals.workMinutes += day.workMinutes
      totals.overtimeMinutes += day.overtimeMinutes!
    }
  }
  return totals
}

/** その日の打刻データから今の状態を決める */
export function getPunchState(record: AttendanceRecord | null | undefined): PunchState {
  if (!record) return 'notStarted'
  if (record.clockOut !== null) return 'finished'
  const last = record.breaks.at(-1)
  if (last && last.end === null) return 'onBreak'
  return 'working'
}

/** 状態ごとに押せる打刻 */
export function allowedActions(state: PunchState): PunchAction[] {
  switch (state) {
    case 'notStarted':
      return ['clockIn']
    case 'working':
      return ['breakStart', 'clockOut']
    case 'onBreak':
      return ['breakEnd']
    case 'finished':
      return []
  }
}

export const PUNCH_ACTION_LABELS: Record<PunchAction, string> = {
  clockIn: '出勤',
  breakStart: '休憩開始',
  breakEnd: '休憩終了',
  clockOut: '退勤',
}

export const PUNCH_STATE_LABELS: Record<PunchState, string> = {
  notStarted: '出勤前',
  working: '勤務中',
  onBreak: '休憩中',
  finished: '退勤済み',
}

export interface AttendanceInput {
  clockIn: string
  clockOut: string | null
  breaks: { start: string, end: string }[]
}

/**
 * 管理者の修正内容を検査し、エラーメッセージの一覧を返す（空なら問題なし）。
 * 日をまたぐ勤務は扱わない。
 */
export function validateAttendance(input: AttendanceInput): string[] {
  const errors: string[] = []
  const times = [input.clockIn, input.clockOut, ...input.breaks.flatMap(b => [b.start, b.end])]
  if (times.some(t => t !== null && !isValidTime(t))) {
    return ['時刻は HH:MM の形式で入力してください。']
  }

  const clockIn = toMinutes(input.clockIn)
  const clockOut = input.clockOut === null ? null : toMinutes(input.clockOut)
  if (clockOut !== null && clockOut <= clockIn) {
    errors.push('退勤は出勤より後の時刻にしてください。')
  }

  const sorted = input.breaks
    .map((b, i) => ({ no: i + 1, start: toMinutes(b.start), end: toMinutes(b.end) }))
    .sort((a, b) => a.start - b.start)
  for (const b of sorted) {
    if (b.end <= b.start) {
      errors.push(`休憩${b.no}：終了は開始より後の時刻にしてください。`)
    }
    if (b.start < clockIn) {
      errors.push(`休憩${b.no}：出勤より前に休憩は始められません。`)
    }
    if (clockOut !== null && b.end > clockOut) {
      errors.push(`休憩${b.no}：退勤より後まで休憩は取れません。`)
    }
  }
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i]!.start < sorted[i - 1]!.end) {
      errors.push(`休憩${sorted[i - 1]!.no}と休憩${sorted[i]!.no}の時間が重なっています。`)
    }
  }
  return errors
}
