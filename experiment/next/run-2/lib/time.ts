// 日本時間（Asia/Tokyo）の日付・時刻を扱うユーティリティ。
// 日付は "YYYY-MM-DD"、時刻は "HH:MM"、月は "YYYY-MM" の文字列で扱う。

export const TIME_ZONE = "Asia/Tokyo";

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** 指定時刻（省略時は現在）の日本時間の日付と時刻（分単位、秒は切り捨て）を返す。 */
export function nowInTokyo(at: Date = new Date()): { date: string; time: string } {
  const parts = Object.fromEntries(
    formatter.formatToParts(at).map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

export function isValidTime(value: string): boolean {
  return TIME_RE.test(value);
}

export function isValidMonth(value: string): boolean {
  return MONTH_RE.test(value);
}

export function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  return d <= daysInMonth(y, m);
}

/** "HH:MM" を 0時からの経過分に変換する。 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** 分数を "H:MM" 形式（例: 8:05）で表す。画面表示用。 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** "YYYY-MM" に含まれる日付を順に返す。 */
export function datesInMonth(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const count = daysInMonth(y, m);
  return Array.from(
    { length: count },
    (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`,
  );
}

/** 曜日（0=日曜〜6=土曜）。 */
export function dayOfWeek(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isWeekday(date: string): boolean {
  const w = dayOfWeek(date);
  return w !== 0 && w !== 6;
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function addMonths(month: string, months: number): string {
  const [y, m] = month.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + months, 1));
  return dt.toISOString().slice(0, 7);
}

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

const TOKYO_OFFSET_MS = 9 * 60 * 60 * 1000; // 日本は夏時間がないので常に UTC+9

/** 次の日本時間0時までのミリ秒。 */
export function msUntilNextTokyoMidnight(now: Date = new Date()): number {
  const { date } = nowInTokyo(now);
  const [y, m, d] = date.split("-").map(Number);
  const nextMidnight = Date.UTC(y, m - 1, d + 1) - TOKYO_OFFSET_MS;
  return nextMidnight - now.getTime();
}
