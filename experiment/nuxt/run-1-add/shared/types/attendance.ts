export type Role = 'admin' | 'employee'

/** 画面・APIに返すユーザー情報（パスワードは含めない） */
export interface PublicUser {
  id: string
  name: string
  email: string
  role: Role
}

/** 休憩。時刻はその日の 0:00 からの経過分 */
export interface BreakPeriod {
  start: number
  /** 休憩中なら null */
  end: number | null
}

/** 1人・1日分の勤怠。時刻はその日の 0:00 からの経過分（日本時間） */
export interface AttendanceRecord {
  userId: string
  /** YYYY-MM-DD（日本時間） */
  date: string
  clockIn: number
  /** 未退勤なら null */
  clockOut: number | null
  breaks: BreakPeriod[]
  updatedAt: string
  updatedBy: string
}

export type PunchAction = 'clock_in' | 'break_start' | 'break_end' | 'clock_out'

export type PunchState = 'not_started' | 'working' | 'on_break' | 'finished'

/**
 * complete: 退勤済み
 * missing: 退勤がない（打刻漏れ）
 * in_progress: 今日の分で、まだ勤務中
 */
export type DayStatus = 'complete' | 'missing' | 'in_progress'

export interface DaySummary {
  date: string
  clockIn: number
  clockOut: number | null
  breakMinutes: number
  /** 打刻漏れ・勤務中は null */
  workMinutes: number | null
  /** 打刻漏れ・勤務中は null */
  overtimeMinutes: number | null
  status: DayStatus
}

export interface MonthTotals {
  /** 出勤日数（打刻漏れの日も出勤した日として数える） */
  workDays: number
  totalBreakMinutes: number
  totalWorkMinutes: number
  totalOvertimeMinutes: number
  missingCount: number
}

export interface DayRow {
  date: string
  record: AttendanceRecord | null
  summary: DaySummary | null
}

export interface MonthlyReport {
  user: PublicUser
  month: string
  today: string
  days: DayRow[]
  totals: MonthTotals
}

export interface EmployeeMonthSummary {
  user: PublicUser
  totals: MonthTotals
}

export interface TodayStatus {
  date: string
  record: AttendanceRecord | null
  state: PunchState
  allowedActions: PunchAction[]
  summary: DaySummary | null
}

/** 管理者の修正APIが受け取る形。時刻は HH:MM */
export interface RecordInput {
  clockIn: string
  clockOut: string | null
  breaks: { start: string, end: string }[]
}

export interface MissingPunchEntry {
  id: number
  userId: string
  date: string
  clockIn: number
  detectedAt: string
}

export interface MissingPunchView extends MissingPunchEntry {
  userName: string
  /** 検出後に管理者が退勤を入れた、または記録を削除した */
  resolved: boolean
}

export interface DetectionRun {
  id: number
  targetDate: string
  ranAt: string
  trigger: 'schedule' | 'manual'
  found: number
  added: number
}
