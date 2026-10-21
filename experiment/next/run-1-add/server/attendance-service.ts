// 勤怠データを API の応答の形に変換する。

import { calcDay, summarizeDays } from "@/lib/attendance";
import { formatTime } from "@/lib/time";
import type { AttendanceRecord, AttendanceRow, MonthTotals } from "@/lib/types";
import { listRecordsByMonth } from "./store";

export function toRow(record: AttendanceRecord, today: string): AttendanceRow {
  return {
    date: record.date,
    clockIn: formatTime(record.clockIn),
    clockOut: record.clockOut === null ? null : formatTime(record.clockOut),
    breaks: record.breaks.map((b) => ({ start: formatTime(b.start), end: b.end === null ? null : formatTime(b.end) })),
    ...calcDay(record, today),
  };
}

export function getMonthlyAttendance(
  userId: string,
  month: string,
  today: string,
): { rows: AttendanceRow[]; totals: MonthTotals } {
  const rows = listRecordsByMonth(userId, month).map((r) => toRow(r, today));
  return { rows, totals: summarizeDays(rows) };
}
