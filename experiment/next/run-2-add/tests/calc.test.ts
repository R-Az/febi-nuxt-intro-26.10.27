import { describe, expect, it } from "vitest";
import {
  calcBreakMinutes,
  calcOvertimeMinutes,
  calcWorkMinutes,
  summarizeDay,
  summarizeMonth,
} from "@/lib/attendance/calc";
import type { AttendanceRecord } from "@/lib/types";

const TODAY = "2026-10-20";

function record(partial: Partial<AttendanceRecord>): AttendanceRecord {
  return {
    userId: "E001",
    date: "2026-10-01",
    clockIn: "09:00",
    clockOut: "18:00",
    breaks: [{ start: "12:00", end: "13:00" }],
    ...partial,
  };
}

describe("休憩時間", () => {
  it("複数の休憩を合計する", () => {
    expect(
      calcBreakMinutes([
        { start: "12:00", end: "13:00" },
        { start: "15:00", end: "15:15" },
      ]),
    ).toBe(75);
  });

  it("休憩がなければ0分", () => {
    expect(calcBreakMinutes([])).toBe(0);
  });

  it("終わっていない休憩は数えない", () => {
    expect(
      calcBreakMinutes([
        { start: "12:00", end: "12:45" },
        { start: "15:00", end: null },
      ]),
    ).toBe(45);
  });
});

describe("実働時間 = 退勤 − 出勤 − 休憩時間", () => {
  it("9:00〜18:00、休憩60分なら480分", () => {
    expect(calcWorkMinutes("09:00", "18:00", 60)).toBe(480);
  });

  it("分単位で計算する", () => {
    expect(calcWorkMinutes("08:47", "19:13", 45)).toBe(10 * 60 + 26 - 45);
  });
});

describe("残業時間 = 実働時間 − 8時間（マイナスなら0）", () => {
  it("ちょうど8時間なら0分", () => {
    expect(calcOvertimeMinutes(480)).toBe(0);
  });

  it("8時間を1分超えたら1分", () => {
    expect(calcOvertimeMinutes(481)).toBe(1);
  });

  it("8時間未満ならマイナスにせず0分", () => {
    expect(calcOvertimeMinutes(300)).toBe(0);
  });

  it("10時間30分なら150分", () => {
    expect(calcOvertimeMinutes(630)).toBe(150);
  });
});

describe("1日の集計", () => {
  it("出勤・退勤・休憩から実働と残業を出す", () => {
    const day = summarizeDay(record({ clockIn: "09:00", clockOut: "20:30" }), TODAY);
    expect(day).toMatchObject({
      status: "complete",
      breakMinutes: 60,
      workMinutes: 630,
      overtimeMinutes: 150,
    });
  });

  it("退勤がない過去の日は、実働・残業を計算せず打刻漏れにする", () => {
    const day = summarizeDay(record({ date: "2026-10-19", clockOut: null }), TODAY);
    expect(day.status).toBe("missing");
    expect(day.workMinutes).toBeNull();
    expect(day.overtimeMinutes).toBeNull();
  });

  it("今日の未退勤は打刻漏れではなく勤務中とする", () => {
    const day = summarizeDay(record({ date: TODAY, clockOut: null }), TODAY);
    expect(day.status).toBe("working");
    expect(day.workMinutes).toBeNull();
    expect(day.overtimeMinutes).toBeNull();
  });
});

describe("月の集計", () => {
  const records = [
    record({ date: "2026-10-01", clockIn: "09:00", clockOut: "18:00" }), // 実働480 残業0
    record({ date: "2026-10-02", clockIn: "09:00", clockOut: "20:00" }), // 実働600 残業120
    record({ date: "2026-10-05", clockIn: "09:00", clockOut: null }), // 打刻漏れ
  ];

  it("打刻漏れの日は時間の合計に含めず、件数として数える", () => {
    const { totals } = summarizeMonth(records, "2026-10", TODAY);
    expect(totals).toEqual({
      workDays: 3,
      breakMinutes: 120,
      workMinutes: 1080,
      overtimeMinutes: 120,
      missingCount: 1,
    });
  });

  it("月の全日を並べ、記録がない日は null にする", () => {
    const { days } = summarizeMonth(records, "2026-10", TODAY);
    expect(days).toHaveLength(31);
    expect(days[0].summary?.workMinutes).toBe(480);
    expect(days[2].summary).toBeNull();
  });

  it("記録がない月の合計はすべて0", () => {
    const { totals } = summarizeMonth([], "2026-02", TODAY);
    expect(totals).toEqual({
      workDays: 0,
      breakMinutes: 0,
      workMinutes: 0,
      overtimeMinutes: 0,
      missingCount: 0,
    });
  });
});
