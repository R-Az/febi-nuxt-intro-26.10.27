import { describe, expect, it } from "vitest";
import { buildAttendanceCsv } from "@/lib/csv";

const base = { updatedAt: "", updatedBy: "" };

describe("buildAttendanceCsv", () => {
  it("BOM 付き・CRLF で、打刻漏れの日は実働・残業を空欄にして備考に書く", () => {
    const csv = buildAttendanceCsv(
      [
        {
          userId: "E001",
          userName: "鈴木 一郎",
          record: { ...base, userId: "E001", date: "2026-10-01", clockIn: 540, clockOut: 1170, breaks: [{ start: 720, end: 780 }] },
        },
        {
          userId: "E001",
          userName: "鈴木 一郎",
          record: { ...base, userId: "E001", date: "2026-10-02", clockIn: 545, clockOut: null, breaks: [{ start: 720, end: 780 }] },
        },
      ],
      "2026-10-19",
    );
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1).split("\r\n")).toEqual([
      "従業員ID,氏名,日付,出勤,退勤,休憩(分),実働(分),残業(分),備考",
      "E001,鈴木 一郎,2026-10-01,09:00,19:30,60,570,90,",
      "E001,鈴木 一郎,2026-10-02,09:05,,60,,,打刻漏れ",
      "",
    ]);
  });
});
