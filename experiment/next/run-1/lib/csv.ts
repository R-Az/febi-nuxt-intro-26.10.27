// 勤怠 CSV の組み立て（純粋関数）。Excel で開けるよう UTF-8 BOM 付き・CRLF 改行にする。

import { calcDay, STATUS_LABEL } from "./attendance";
import { formatTime } from "./time";
import type { AttendanceRecord } from "./types";

export const CSV_HEADER = ["従業員ID", "氏名", "日付", "出勤", "退勤", "休憩(分)", "実働(分)", "残業(分)", "備考"];

const BOM = "﻿";

function escapeCsv(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function buildAttendanceCsv(
  rows: { userId: string; userName: string; record: AttendanceRecord }[],
  today: string,
): string {
  const lines = [CSV_HEADER];
  for (const { userId, userName, record } of rows) {
    const day = calcDay(record, today);
    lines.push([
      userId,
      userName,
      record.date,
      formatTime(record.clockIn),
      record.clockOut === null ? "" : formatTime(record.clockOut),
      String(day.breakMinutes),
      day.workMinutes === null ? "" : String(day.workMinutes),
      day.overtimeMinutes === null ? "" : String(day.overtimeMinutes),
      STATUS_LABEL[day.status],
    ]);
  }
  return BOM + lines.map((cols) => cols.map(escapeCsv).join(",")).join("\r\n") + "\r\n";
}
