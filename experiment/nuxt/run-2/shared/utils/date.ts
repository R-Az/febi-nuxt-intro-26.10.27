// 日本時間（Asia/Tokyo）の日付・時刻を扱う。
// 日本には夏時間がないので、UTC に 9 時間足して UTC の getter で読む。
const JST_OFFSET_MS = 9 * 60 * 60 * 1000

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/
const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

const pad = (n: number) => String(n).padStart(2, '0')

/** 日本時間の今の日付 'YYYY-MM-DD' と時刻 'HH:MM' */
export function nowInJst(now: Date = new Date()): { date: string, time: string } {
  const d = new Date(now.getTime() + JST_OFFSET_MS)
  return {
    date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
  }
}

export function isValidMonth(value: string): boolean {
  return MONTH_PATTERN.test(value)
}

export function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y!, m! - 1, d!))
  return date.getUTCMonth() === m! - 1
}

/** 'YYYY-MM-DD' に日数を足す */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const t = new Date(Date.UTC(y!, m! - 1, d! + days))
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
}

/** 'YYYY-MM' に月数を足す */
export function addMonths(month: string, months: number): string {
  const [y, m] = month.split('-').map(Number)
  const t = new Date(Date.UTC(y!, m! - 1 + months, 1))
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}`
}

/** その月の全日付 */
export function datesInMonth(month: string): string[] {
  const [y, m] = month.split('-').map(Number)
  const last = new Date(Date.UTC(y!, m!, 0)).getUTCDate()
  return Array.from({ length: last }, (_, i) => `${month}-${pad(i + 1)}`)
}

/** 0 = 日曜 ... 6 = 土曜 */
export function dayOfWeek(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay()
}

export function isWeekday(date: string): boolean {
  const w = dayOfWeek(date)
  return w !== 0 && w !== 6
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

/** '10/20(火)' のような表示 */
export function formatDateLabel(date: string): string {
  const [, m, d] = date.split('-').map(Number)
  return `${m}/${d}(${WEEKDAY_LABELS[dayOfWeek(date)]})`
}

/** '2026年10月' のような表示 */
export function formatMonthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return `${y}年${m}月`
}
