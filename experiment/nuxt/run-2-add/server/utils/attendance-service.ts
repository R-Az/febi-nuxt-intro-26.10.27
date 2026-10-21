import type {
  AttendanceRecord,
  DailyRow,
  MonthlyAttendance,
  PublicUser,
  PunchAction,
  PunchStatus,
} from '#shared/types/attendance'
import { allowedActions, calcDay, getPunchState, PUNCH_ACTION_LABELS, PUNCH_STATE_LABELS, summarize } from '#shared/utils/attendance'
import { addDays, datesInMonth, isValidDate, isValidMonth, nowInJst } from '#shared/utils/date'

/** クエリの month を検査する。未指定なら今月 */
export function parseMonth(value: unknown): string {
  if (value === undefined || value === '') return nowInJst().date.slice(0, 7)
  if (typeof value !== 'string' || !isValidMonth(value)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: '月は YYYY-MM の形式で指定してください。' })
  }
  return value
}

export function parseDate(value: unknown): string {
  if (typeof value !== 'string' || !isValidDate(value)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: '日付は YYYY-MM-DD の形式で指定してください。' })
  }
  return value
}

/** 従業員を取得する。いなければ 404 */
export async function getEmployeeOrThrow(userId: string): Promise<PublicUser> {
  const user = await findUserById(userId)
  if (!user || user.role !== 'employee') {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: '従業員が見つかりません。' })
  }
  return user
}

/** 月の日ごとの一覧と合計。記録がない日も行として含める */
export async function buildMonthlyAttendance(user: PublicUser, month: string): Promise<MonthlyAttendance> {
  const records = await listAttendanceByMonth(user.id, month)
  const today = nowInJst().date
  const byDate = new Map(records.map(r => [r.date, r]))
  const days: DailyRow[] = datesInMonth(month).map((date) => {
    const record = byDate.get(date)
    if (!record) {
      return { date, clockIn: null, clockOut: null, breaks: [], hasRecord: false, breakMinutes: 0, workMinutes: null, overtimeMinutes: null, missingClockOut: false, inProgress: false }
    }
    return { date, clockIn: record.clockIn, clockOut: record.clockOut, breaks: record.breaks, hasRecord: true, ...calcDay(record, today) }
  })
  return { user, month, days, totals: summarize(records, today) }
}

export async function getPunchStatus(userId: string, now = new Date()): Promise<PunchStatus> {
  const { date } = nowInJst(now)
  const record = await getAttendance(userId, date)
  const state = getPunchState(record)
  return { date, state, allowedActions: allowedActions(state), record }
}

/** 打刻する。今の状態で押せない打刻なら 409 */
export async function punch(userId: string, action: PunchAction, now = new Date()): Promise<PunchStatus> {
  const { date, time } = nowInJst(now)
  const current = await getPunchStatus(userId, now)
  if (!current.allowedActions.includes(action)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Conflict',
      message: `${PUNCH_STATE_LABELS[current.state]}のため「${PUNCH_ACTION_LABELS[action]}」は打刻できません。`,
    })
  }

  let record: AttendanceRecord
  if (action === 'clockIn') {
    record = { userId, date, clockIn: time, clockOut: null, breaks: [] }
  }
  else {
    record = current.record!
    if (action === 'breakStart') record.breaks.push({ start: time, end: null })
    if (action === 'breakEnd') record.breaks.at(-1)!.end = time
    if (action === 'clockOut') record.clockOut = time
  }
  await saveAttendance(record)
  return getPunchStatus(userId, now)
}

/**
 * 指定日の打刻漏れ（出勤はあるが退勤がない）を検出して記録する。
 * 同じ人・同じ日は二重に記録しない。
 */
export async function detectMissingPunches(date: string, detectedAt = new Date()) {
  const records = await listAttendanceByDate(date)
  const detected = []
  for (const record of records.filter(r => r.clockOut === null)) {
    const log = await addMissingPunchLog(record.userId, record.date, detectedAt.toISOString())
    if (log) detected.push(log)
  }
  return detected
}

/** 日本時間で「昨日」の日付 */
export function yesterdayInJst(now = new Date()): string {
  return addDays(nowInJst(now).date, -1)
}
