import type { H3Event } from 'h3'
import type { DayRow, MonthlyReport, PublicUser } from '#shared/types/attendance'
import { summarizeDay, summarizeMonth } from '#shared/utils/attendance'
import { currentMonth, datesInMonth, isValidDateString, isValidMonthString, tokyoNow } from '#shared/utils/time'

/** ?month= を読む。省略時は今月、形式が不正なら 400 */
export function getMonthQuery(event: H3Event): string {
  const { month } = getQuery(event)
  if (month === undefined || month === '') return currentMonth()
  if (!isValidMonthString(month)) {
    throw createError({ statusCode: 400, message: '月は YYYY-MM の形式で指定してください。' })
  }
  return month
}

export function assertDate(value: unknown): string {
  if (!isValidDateString(value)) {
    throw createError({ statusCode: 400, message: '日付は YYYY-MM-DD の形式で指定してください。' })
  }
  return value
}

/** 1人分の月次レポート（月の全日付。勤怠がない日は record: null） */
export async function buildMonthlyReport(user: PublicUser, month: string): Promise<MonthlyReport> {
  const today = tokyoNow().date
  const records = new Map((await listRecordsByMonth(user.id, month)).map(r => [r.date, r]))
  const days: DayRow[] = datesInMonth(month).map((date) => {
    const record = records.get(date) ?? null
    return { date, record, summary: record ? summarizeDay(record, today) : null }
  })
  const totals = summarizeMonth(days.flatMap(d => (d.summary ? [d.summary] : [])))
  return { user, month, today, days, totals }
}

export async function getEmployeeOr404(userId: string): Promise<PublicUser> {
  const user = await findUserById(userId)
  if (!user || user.role !== 'employee') {
    throw createError({ statusCode: 404, message: '従業員が見つかりません。' })
  }
  return user
}
