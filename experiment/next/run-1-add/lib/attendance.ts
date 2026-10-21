// 勤怠の計算ルール（純粋関数）。
//   実働時間 = 退勤 − 出勤 − 休憩時間
//   残業時間 = 実働時間 − 8 時間（マイナスなら 0）
//   退勤がない日は実働・残業を計算しない（過去の日は打刻漏れ、当日は勤務中）

import type { BreakPeriod, DayResult, MonthTotals } from "./types";

export const STANDARD_WORK_MINUTES = 8 * 60;

/** 終了済みの休憩の合計（分）。休憩中のものは数えない。 */
export function calcBreakMinutes(breaks: readonly BreakPeriod[]): number {
  return breaks.reduce((sum, b) => (b.end === null ? sum : sum + (b.end - b.start)), 0);
}

export function calcOvertimeMinutes(workMinutes: number): number {
  return Math.max(0, workMinutes - STANDARD_WORK_MINUTES);
}

/**
 * 1 日分の勤怠を計算する。
 * @param today 日本時間の今日の日付。退勤がないとき、今日（以降）なら勤務中、それより前なら打刻漏れとする。
 */
export function calcDay(
  record: { date: string; clockIn: number; clockOut: number | null; breaks: readonly BreakPeriod[] },
  today: string,
): DayResult {
  const breakMinutes = calcBreakMinutes(record.breaks);
  if (record.clockOut === null) {
    return {
      breakMinutes,
      workMinutes: null,
      overtimeMinutes: null,
      status: record.date >= today ? "in_progress" : "missing_clock_out",
    };
  }
  const workMinutes = record.clockOut - record.clockIn - breakMinutes;
  return {
    breakMinutes,
    workMinutes,
    overtimeMinutes: calcOvertimeMinutes(workMinutes),
    status: "complete",
  };
}

/** 月の合計。出勤日数は出勤の打刻がある日の数。実働・残業は退勤済みの日だけを合計する。 */
export function summarizeDays(days: readonly DayResult[]): MonthTotals {
  return days.reduce<MonthTotals>(
    (t, d) => ({
      workDays: t.workDays + 1,
      breakMinutes: t.breakMinutes + d.breakMinutes,
      workMinutes: t.workMinutes + (d.workMinutes ?? 0),
      overtimeMinutes: t.overtimeMinutes + (d.overtimeMinutes ?? 0),
      missingCount: t.missingCount + (d.status === "missing_clock_out" ? 1 : 0),
    }),
    { workDays: 0, breakMinutes: 0, workMinutes: 0, overtimeMinutes: 0, missingCount: 0 },
  );
}

export const STATUS_LABEL: Record<DayResult["status"], string> = {
  complete: "",
  missing_clock_out: "打刻漏れ",
  in_progress: "勤務中",
};
