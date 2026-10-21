// 勤怠のCSV出力（受け入れ条件7）。
// Excel で文字化けしないよう UTF-8 の BOM を付け、改行は CRLF にする。

import type { DaySummary, PublicUser } from "@/lib/types";

export const CSV_HEADER = [
  "従業員ID",
  "氏名",
  "日付",
  "出勤",
  "退勤",
  "休憩(分)",
  "実働(分)",
  "残業(分)",
  "備考",
] as const;

const BOM = "﻿";

function escapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function remarks(summary: DaySummary): string {
  if (summary.status === "missing") return "打刻漏れ";
  if (summary.status === "working") return "勤務中";
  return "";
}

export function toCsvRow(user: PublicUser, summary: DaySummary): string[] {
  return [
    user.id,
    user.name,
    summary.date,
    summary.clockIn ?? "",
    summary.clockOut ?? "",
    String(summary.breakMinutes),
    summary.workMinutes === null ? "" : String(summary.workMinutes),
    summary.overtimeMinutes === null ? "" : String(summary.overtimeMinutes),
    remarks(summary),
  ];
}

export function buildAttendanceCsv(
  rows: { user: PublicUser; summary: DaySummary }[],
): string {
  const lines = [
    [...CSV_HEADER],
    ...rows.map(({ user, summary }) => toCsvRow(user, summary)),
  ].map((cells) => cells.map(escapeCell).join(","));
  return BOM + lines.join("\r\n") + "\r\n";
}
