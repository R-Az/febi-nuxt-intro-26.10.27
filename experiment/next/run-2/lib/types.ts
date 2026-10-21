// サーバー・画面の両方で使う型。

export type Role = "admin" | "employee";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type BreakPeriod = {
  /** "HH:MM" */
  start: string;
  /** "HH:MM"。休憩中は null */
  end: string | null;
};

export type AttendanceRecord = {
  userId: string;
  /** "YYYY-MM-DD"（日本時間） */
  date: string;
  /** "HH:MM" */
  clockIn: string | null;
  /** "HH:MM"。未退勤なら null */
  clockOut: string | null;
  breaks: BreakPeriod[];
};

/**
 * 1日分の勤怠の状態。
 * - complete: 出勤・退勤がそろっている
 * - missing: 退勤がない（打刻漏れ）
 * - working: 当日の勤務中（まだ退勤していないだけなので打刻漏れとはしない）
 */
export type DayStatus = "complete" | "missing" | "working";

export type DaySummary = {
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  breaks: BreakPeriod[];
  breakMinutes: number;
  /** 打刻漏れ・勤務中の日は null */
  workMinutes: number | null;
  /** 打刻漏れ・勤務中の日は null */
  overtimeMinutes: number | null;
  status: DayStatus;
};

export type MonthTotals = {
  /** 出勤打刻がある日の数（打刻漏れの日も含む） */
  workDays: number;
  breakMinutes: number;
  workMinutes: number;
  overtimeMinutes: number;
  missingCount: number;
};

export type MonthlyAttendance = {
  user: PublicUser;
  month: string;
  /** 月の全日。記録がない日は null */
  days: { date: string; summary: DaySummary | null }[];
  totals: MonthTotals;
};

export type PunchType = "clock_in" | "break_start" | "break_end" | "clock_out";

export type PunchState = "not_started" | "working" | "on_break" | "finished";

export type TodayStatus = {
  date: string;
  state: PunchState;
  record: AttendanceRecord | null;
  allowed: PunchType[];
};

export type EmployeeMonthlySummary = {
  user: PublicUser;
  totals: MonthTotals;
};

export type MissingPunchDetection = {
  userId: string;
  userName: string;
  date: string;
  clockIn: string | null;
  detectedAt: string;
  /** 検出後に退勤が入力されたか（一覧取得時点の状態） */
  resolved: boolean;
};

export type DetectionRun = {
  ranAt: string;
  targetDate: string;
  trigger: "schedule" | "startup" | "manual" | "external";
  foundCount: number;
};
