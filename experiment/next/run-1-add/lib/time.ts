// 日本時間（Asia/Tokyo）の日付・時刻を扱うユーティリティ。
// 日本はサマータイムがなく常に UTC+9 なので、固定オフセットで計算する。
// 日付は "YYYY-MM-DD"、月は "YYYY-MM"、時刻はその日の 0:00 からの経過分（0〜1439）で表す。

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"] as const;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** 指定した瞬間の日本時間での日付と時刻（分）を返す。秒以下は切り捨てる。 */
export function nowInJst(now: Date = new Date()): { date: string; minutes: number } {
  const d = new Date(now.getTime() + JST_OFFSET_MS);
  const date = `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  return { date, minutes: d.getUTCHours() * 60 + d.getUTCMinutes() };
}

export function todayInJst(now: Date = new Date()): string {
  return nowInJst(now).date;
}

export function currentMonthInJst(now: Date = new Date()): string {
  return todayInJst(now).slice(0, 7);
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function isValidMonth(value: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(value)) return false;
  const m = Number(value.slice(5, 7));
  return m >= 1 && m <= 12;
}

function dateToUtc(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function utcToDate(dt: Date): string {
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

export function addDays(date: string, days: number): string {
  return utcToDate(new Date(dateToUtc(date).getTime() + days * DAY_MS));
}

export function addMonths(month: string, months: number): string {
  const [y, m] = month.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + months, 1));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}`;
}

/** 月に含まれる日付を 1 日から末日まで返す。 */
export function datesInMonth(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: last }, (_, i) => `${month}-${pad2(i + 1)}`);
}

export function dayOfWeek(date: string): number {
  return dateToUtc(date).getUTCDay();
}

export function isWeekday(date: string): boolean {
  const w = dayOfWeek(date);
  return w >= 1 && w <= 5;
}

/** 経過分を "HH:MM" に整形する（時刻用）。 */
export function formatTime(minutes: number): string {
  return `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`;
}

/** "HH:MM" を経過分に変換する。形式が不正なら null。 */
export function parseTime(value: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** 分数を "H:MM" に整形する（時間の長さ用。24 時間を超えてもよい）。 */
export function formatDuration(minutes: number): string {
  const sign = minutes < 0 ? "-" : "";
  const abs = Math.abs(minutes);
  return `${sign}${Math.floor(abs / 60)}:${pad2(abs % 60)}`;
}

/** 次の日本時間 0:00 までのミリ秒。 */
export function msUntilNextJstMidnight(now: Date = new Date()): number {
  const jst = now.getTime() + JST_OFFSET_MS;
  const nextMidnight = Math.floor(jst / DAY_MS) * DAY_MS + DAY_MS;
  return nextMidnight - jst;
}

/** 日本時間の日付と時刻（分）から ISO 文字列（UTC）を作る。 */
export function jstToIso(date: string, minutes: number): string {
  return new Date(dateToUtc(date).getTime() + minutes * 60 * 1000 - JST_OFFSET_MS).toISOString();
}

/** ISO 文字列を日本時間の "YYYY-MM-DD HH:MM" に整形する。 */
export function formatDateTimeJst(iso: string): string {
  const { date, minutes } = nowInJst(new Date(iso));
  return `${date} ${formatTime(minutes)}`;
}

/** "YYYY-MM-DD" を "M/D(曜)" に整形する。 */
export function formatDateShort(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${m}/${d}(${WEEKDAY_JA[dayOfWeek(date)]})`;
}

/** "YYYY-MM" を "YYYY年M月" に整形する。 */
export function formatMonth(month: string): string {
  return `${month.slice(0, 4)}年${Number(month.slice(5, 7))}月`;
}
