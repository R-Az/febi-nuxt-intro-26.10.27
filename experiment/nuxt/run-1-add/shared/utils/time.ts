// 日付・時刻のユーティリティ。日付は 'YYYY-MM-DD'、月は 'YYYY-MM'、時刻は 0:00 からの経過分で扱う。
// サーバーのタイムゾーン設定に左右されないよう、現在時刻は必ず Asia/Tokyo を明示して求める。

export const TIME_ZONE = 'Asia/Tokyo'

export const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

const tokyoFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** 日本時間での日付と、0:00 からの経過分（分未満は切り捨て） */
export function tokyoNow(now: Date = new Date()): { date: string, minutes: number } {
  const parts: Record<string, string> = {}
  for (const p of tokyoFormatter.formatToParts(now)) parts[p.type] = p.value
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  }
}

export function currentMonth(now: Date = new Date()): string {
  return monthOf(tokyoNow(now).date)
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** 分 → 'HH:MM' */
export function minutesToHHMM(minutes: number): string {
  return `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`
}

/** 'HH:MM' → 分。形式が不正なら null */
export function parseHHMM(value: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

/** 分 → 'H:MM'（合計時間の表示用）。null は '—' */
export function formatDuration(minutes: number | null): string {
  if (minutes === null) return '—'
  return `${Math.floor(minutes / 60)}:${pad2(minutes % 60)}`
}

function toUtcDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(y, m - 1, d))
}

function fromUtcDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

export function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return fromUtcDate(toUtcDate(value)) === value
}

export function isValidMonthString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
}

export function addDays(date: string, days: number): string {
  const d = toUtcDate(date)
  d.setUTCDate(d.getUTCDate() + days)
  return fromUtcDate(d)
}

export function monthOf(date: string): string {
  return date.slice(0, 7)
}

export function shiftMonth(month: string, diff: number): string {
  const [y, m] = month.split('-').map(Number) as [number, number]
  const d = new Date(Date.UTC(y, m - 1 + diff, 1))
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`
}

/** その月の全日付 */
export function datesInMonth(month: string): string[] {
  const dates: string[] = []
  let date = `${month}-01`
  while (monthOf(date) === month) {
    dates.push(date)
    date = addDays(date, 1)
  }
  return dates
}

/** 0 = 日曜 */
export function dayOfWeek(date: string): number {
  return toUtcDate(date).getUTCDay()
}

export function isWeekday(date: string): boolean {
  const w = dayOfWeek(date)
  return w !== 0 && w !== 6
}

/** '2026-10-19' → '10/19(月)' */
export function formatDateLabel(date: string): string {
  const [, m, d] = date.split('-').map(Number)
  return `${m}/${d}(${WEEKDAY_LABELS[dayOfWeek(date)]})`
}

/** ISO 日時 → 日本時間の 'YYYY-MM-DD HH:MM' */
export function formatDateTimeJST(iso: string): string {
  const { date, minutes } = tokyoNow(new Date(iso))
  return `${date} ${minutesToHHMM(minutes)}`
}
