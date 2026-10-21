import { describe, expect, it } from "vitest";
import { calcBreakMinutes, calcDay, calcOvertimeMinutes, summarizeDays } from "@/lib/attendance";
import { parseTime } from "@/lib/time";

const t = (hhmm: string) => parseTime(hhmm)!;
const TODAY = "2026-10-19";

describe("calcBreakMinutes", () => {
  it("終了した休憩の合計を返す", () => {
    expect(
      calcBreakMinutes([
        { start: t("12:00"), end: t("13:00") },
        { start: t("15:00"), end: t("15:15") },
      ]),
    ).toBe(75);
  });

  it("休憩がなければ 0", () => {
    expect(calcBreakMinutes([])).toBe(0);
  });

  it("休憩中（終了なし）のものは数えない", () => {
    expect(calcBreakMinutes([{ start: t("12:00"), end: t("12:30") }, { start: t("15:00"), end: null }])).toBe(30);
  });
});

describe("calcOvertimeMinutes", () => {
  it("8 時間を超えた分が残業", () => {
    expect(calcOvertimeMinutes(9 * 60 + 15)).toBe(75);
  });

  it("ちょうど 8 時間なら 0", () => {
    expect(calcOvertimeMinutes(8 * 60)).toBe(0);
  });

  it("8 時間未満ならマイナスにせず 0", () => {
    expect(calcOvertimeMinutes(6 * 60)).toBe(0);
  });
});

describe("calcDay", () => {
  it("実働 = 退勤 − 出勤 − 休憩、残業 = 実働 − 8 時間", () => {
    const result = calcDay(
      { date: "2026-10-01", clockIn: t("09:00"), clockOut: t("19:30"), breaks: [{ start: t("12:00"), end: t("13:00") }] },
      TODAY,
    );
    expect(result).toEqual({ breakMinutes: 60, workMinutes: 570, overtimeMinutes: 90, status: "complete" });
  });

  it("8 時間ちょうどの日は残業 0", () => {
    const result = calcDay(
      { date: "2026-10-01", clockIn: t("09:00"), clockOut: t("18:00"), breaks: [{ start: t("12:00"), end: t("13:00") }] },
      TODAY,
    );
    expect(result.workMinutes).toBe(480);
    expect(result.overtimeMinutes).toBe(0);
  });

  it("短時間勤務では残業がマイナスにならない", () => {
    const result = calcDay({ date: "2026-10-01", clockIn: t("10:00"), clockOut: t("15:00"), breaks: [] }, TODAY);
    expect(result.workMinutes).toBe(300);
    expect(result.overtimeMinutes).toBe(0);
  });

  it("複数の休憩をすべて差し引く", () => {
    const result = calcDay(
      {
        date: "2026-10-01",
        clockIn: t("08:45"),
        clockOut: t("20:10"),
        breaks: [
          { start: t("12:00"), end: t("13:00") },
          { start: t("15:00"), end: t("15:15") },
          { start: t("18:00"), end: t("18:20") },
        ],
      },
      TODAY,
    );
    // 20:10 − 8:45 = 685 分、休憩 95 分 → 実働 590 分、残業 110 分
    expect(result).toEqual({ breakMinutes: 95, workMinutes: 590, overtimeMinutes: 110, status: "complete" });
  });

  it("分単位で計算する（端数を丸めない）", () => {
    const result = calcDay(
      { date: "2026-10-01", clockIn: t("09:07"), clockOut: t("18:08"), breaks: [{ start: t("12:01"), end: t("12:59") }] },
      TODAY,
    );
    // 541 − 58 = 483
    expect(result.workMinutes).toBe(483);
    expect(result.overtimeMinutes).toBe(3);
  });

  it("退勤がない過去の日は打刻漏れとし、実働・残業を計算しない", () => {
    const result = calcDay(
      { date: "2026-10-16", clockIn: t("09:00"), clockOut: null, breaks: [{ start: t("12:00"), end: t("13:00") }] },
      TODAY,
    );
    expect(result).toEqual({ breakMinutes: 60, workMinutes: null, overtimeMinutes: null, status: "missing_clock_out" });
  });

  it("退勤がない今日の分は勤務中とし、実働・残業を計算しない", () => {
    const result = calcDay({ date: TODAY, clockIn: t("09:00"), clockOut: null, breaks: [] }, TODAY);
    expect(result).toEqual({ breakMinutes: 0, workMinutes: null, overtimeMinutes: null, status: "in_progress" });
  });
});

describe("summarizeDays", () => {
  it("月の合計を出す。打刻漏れの日は実働・残業に含めず件数を数える", () => {
    const days = [
      calcDay({ date: "2026-10-01", clockIn: t("09:00"), clockOut: t("19:00"), breaks: [{ start: t("12:00"), end: t("13:00") }] }, TODAY),
      calcDay({ date: "2026-10-02", clockIn: t("09:00"), clockOut: t("17:00"), breaks: [{ start: t("12:00"), end: t("13:00") }] }, TODAY),
      calcDay({ date: "2026-10-05", clockIn: t("09:00"), clockOut: null, breaks: [{ start: t("12:00"), end: t("13:00") }] }, TODAY),
    ];
    expect(summarizeDays(days)).toEqual({
      workDays: 3,
      breakMinutes: 180,
      workMinutes: 540 + 420,
      overtimeMinutes: 60,
      missingCount: 1,
    });
  });

  it("勤怠がなければすべて 0", () => {
    expect(summarizeDays([])).toEqual({ workDays: 0, breakMinutes: 0, workMinutes: 0, overtimeMinutes: 0, missingCount: 0 });
  });
});
