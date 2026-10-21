import { describe, expect, it } from "vitest";
import { summarizeDay } from "@/lib/attendance/calc";
import { buildAttendanceCsv } from "@/lib/attendance/csv";
import type { PublicUser } from "@/lib/types";

const user: PublicUser = { id: "E001", name: "鈴木 一郎", email: "suzuki@example.com", role: "employee" };
const TODAY = "2026-10-20";

describe("CSV出力", () => {
  const csv = buildAttendanceCsv([
    {
      user,
      summary: summarizeDay(
        {
          userId: "E001",
          date: "2026-10-01",
          clockIn: "09:00",
          clockOut: "19:30",
          breaks: [{ start: "12:00", end: "13:00" }],
        },
        TODAY,
      ),
    },
    {
      user,
      summary: summarizeDay(
        {
          userId: "E001",
          date: "2026-10-02",
          clockIn: "09:05",
          clockOut: null,
          breaks: [{ start: "12:00", end: "12:45" }],
        },
        TODAY,
      ),
    },
  ]);

  it("UTF-8 の BOM で始まる", () => {
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("決められた列順のヘッダーと、CRLF の行になる", () => {
    const lines = csv.slice(1).split("\r\n");
    expect(lines[0]).toBe("従業員ID,氏名,日付,出勤,退勤,休憩(分),実働(分),残業(分),備考");
    expect(lines[1]).toBe("E001,鈴木 一郎,2026-10-01,09:00,19:30,60,570,90,");
  });

  it("打刻漏れの日は実働・残業を空欄にし、備考に「打刻漏れ」と入れる", () => {
    const lines = csv.slice(1).split("\r\n");
    expect(lines[2]).toBe("E001,鈴木 一郎,2026-10-02,09:05,,45,,,打刻漏れ");
  });

  it("カンマや引用符を含む値はエスケープする", () => {
    const tricky = buildAttendanceCsv([
      {
        user: { ...user, name: '鈴木, "一郎"' },
        summary: summarizeDay(
          { userId: "E001", date: "2026-10-01", clockIn: "09:00", clockOut: "18:00", breaks: [] },
          TODAY,
        ),
      },
    ]);
    expect(tricky).toContain('"鈴木, ""一郎"""');
  });
});
