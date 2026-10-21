// サーバーと画面の両方で使う型。

export type Role = "admin" | "employee";

/** 画面に返してよいユーザー情報（パスワードを含まない）。 */
export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

/** 休憩。end が null のものは休憩中。時刻はその日の 0:00 からの経過分。 */
export type BreakPeriod = {
  start: number;
  end: number | null;
};

/** 1 人 1 日分の勤怠。出勤した日だけ存在する。 */
export type AttendanceRecord = {
  userId: string;
  date: string;
  clockIn: number;
  clockOut: number | null;
  breaks: BreakPeriod[];
  updatedAt: string;
  updatedBy: string;
};

export type PunchAction = "clock_in" | "break_start" | "break_end" | "clock_out";

export type PunchState = "not_started" | "working" | "on_break" | "finished";

/**
 * 日の状態。
 * - complete: 退勤済み
 * - missing_clock_out: 退勤の打刻がない（打刻漏れ）
 * - in_progress: 当日で、まだ退勤していない（勤務中）
 */
export type DayStatus = "complete" | "missing_clock_out" | "in_progress";

export type DayResult = {
  breakMinutes: number;
  workMinutes: number | null;
  overtimeMinutes: number | null;
  status: DayStatus;
};

export type MonthTotals = {
  workDays: number;
  breakMinutes: number;
  workMinutes: number;
  overtimeMinutes: number;
  missingCount: number;
};

/** API が返す 1 日分の行（表示用の文字列つき）。 */
export type AttendanceRow = {
  date: string;
  clockIn: string;
  clockOut: string | null;
  breaks: { start: string; end: string | null }[];
} & DayResult;

export type MissingClockOutLog = {
  id: string;
  date: string;
  userId: string;
  userName: string;
  clockIn: string;
  detectedAt: string;
  source: "schedule" | "manual";
};
