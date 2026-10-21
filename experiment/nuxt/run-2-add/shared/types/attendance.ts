export type Role = 'admin' | 'employee'

export interface PublicUser {
  id: string
  name: string
  email: string
  role: Role
}

/** 休憩1回分。休憩中は end が null */
export interface BreakPeriod {
  start: string
  end: string | null
}

/** 1人1日分の打刻データ。時刻はすべて日本時間の 'HH:MM' */
export interface AttendanceRecord {
  userId: string
  /** 'YYYY-MM-DD' */
  date: string
  clockIn: string
  clockOut: string | null
  breaks: BreakPeriod[]
}

export type PunchAction = 'clockIn' | 'breakStart' | 'breakEnd' | 'clockOut'

/** 打刻の状態。出勤前 / 勤務中 / 休憩中 / 退勤済み */
export type PunchState = 'notStarted' | 'working' | 'onBreak' | 'finished'

export interface DayCalculation {
  breakMinutes: number
  /** 退勤がない日は null */
  workMinutes: number | null
  /** 退勤がない日は null */
  overtimeMinutes: number | null
  /** 退勤がない（打刻漏れ） */
  missingClockOut: boolean
  /** 今日の分で、まだ退勤していない（勤務中）。打刻漏れには数えない */
  inProgress: boolean
}

export interface MonthTotals {
  workDays: number
  workMinutes: number
  overtimeMinutes: number
  missingCount: number
}

/** 一覧表示用の1日分の行。記録がない日は record が null */
export interface DailyRow extends DayCalculation {
  date: string
  clockIn: string | null
  clockOut: string | null
  breaks: BreakPeriod[]
  hasRecord: boolean
}

export interface MonthlyAttendance {
  user: PublicUser
  month: string
  days: DailyRow[]
  totals: MonthTotals
}

export interface EmployeeMonthlySummary extends MonthTotals {
  user: PublicUser
}

/** 定期処理が検出した打刻漏れ */
export interface MissingPunchLog {
  id: number
  userId: string
  date: string
  /** ISO 8601 */
  detectedAt: string
}

export interface MissingPunchView extends MissingPunchLog {
  userName: string
  /** 検出後に退勤が補われていれば true */
  resolved: boolean
}

export interface PunchStatus {
  date: string
  state: PunchState
  allowedActions: PunchAction[]
  record: AttendanceRecord | null
}
