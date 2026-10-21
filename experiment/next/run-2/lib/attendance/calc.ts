// 勤怠の計算ルール（受け入れ条件4）。
// 実働時間 = 退勤 − 出勤 − 休憩時間
// 残業時間 = 実働時間 − 8時間（マイナスなら0）
// 退勤がない日は実働・残業を計算せず「打刻漏れ」とする。

import { datesInMonth, timeToMinutes } from "@/lib/time";
import type {
  AttendanceRecord,
  BreakPeriod,
  DaySummary,
  MonthTotals,
} from "@/lib/types";

export const STANDARD_WORK_MINUTES = 8 * 60;

/** 終了している休憩の合計（分）。休憩中（end が null）のものは数えない。 */
export function calcBreakMinutes(breaks: BreakPeriod[]): number {
  return breaks.reduce((sum, b) => {
    if (b.end === null) return sum;
    return sum + (timeToMinutes(b.end) - timeToMinutes(b.start));
  }, 0);
}

export function calcWorkMinutes(
  clockIn: string,
  clockOut: string,
  breakMinutes: number,
): number {
  return timeToMinutes(clockOut) - timeToMinutes(clockIn) - breakMinutes;
}

export function calcOvertimeMinutes(workMinutes: number): number {
  return Math.max(0, workMinutes - STANDARD_WORK_MINUTES);
}

/**
 * 1日分の記録を集計する。
 * @param today 日本時間の今日の日付。今日の未退勤は「勤務中」として扱い、打刻漏れにしない。
 */
export function summarizeDay(record: AttendanceRecord, today: string): DaySummary {
  const breakMinutes = calcBreakMinutes(record.breaks);
  const base = {
    date: record.date,
    clockIn: record.clockIn,
    clockOut: record.clockOut,
    breaks: record.breaks,
    breakMinutes,
  };

  if (record.clockIn === null || record.clockOut === null) {
    return {
      ...base,
      workMinutes: null,
      overtimeMinutes: null,
      status: record.date === today ? "working" : "missing",
    };
  }

  const workMinutes = calcWorkMinutes(record.clockIn, record.clockOut, breakMinutes);
  return {
    ...base,
    workMinutes,
    overtimeMinutes: calcOvertimeMinutes(workMinutes),
    status: "complete",
  };
}

export function emptyTotals(): MonthTotals {
  return { workDays: 0, breakMinutes: 0, workMinutes: 0, overtimeMinutes: 0, missingCount: 0 };
}

/** 日ごとの集計から月の合計を出す。打刻漏れの日の時間は合計に含めない。 */
export function sumTotals(days: DaySummary[]): MonthTotals {
  const totals = emptyTotals();
  for (const day of days) {
    if (day.clockIn !== null) totals.workDays += 1;
    if (day.status === "missing") {
      totals.missingCount += 1;
      continue;
    }
    if (day.status === "complete") {
      totals.breakMinutes += day.breakMinutes;
      totals.workMinutes += day.workMinutes ?? 0;
      totals.overtimeMinutes += day.overtimeMinutes ?? 0;
    }
  }
  return totals;
}

/** 1人分の月の記録を、月の全日に並べて集計する。 */
export function summarizeMonth(
  records: AttendanceRecord[],
  month: string,
  today: string,
): { days: { date: string; summary: DaySummary | null }[]; totals: MonthTotals } {
  const byDate = new Map(records.map((r) => [r.date, r]));
  const days = datesInMonth(month).map((date) => {
    const record = byDate.get(date);
    return { date, summary: record ? summarizeDay(record, today) : null };
  });
  const totals = sumTotals(
    days.flatMap((d) => (d.summary ? [d.summary] : [])),
  );
  return { days, totals };
}
