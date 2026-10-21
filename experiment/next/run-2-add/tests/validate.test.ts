import { describe, expect, it } from "vitest";
import { parseRecordInput, validateRecordInput } from "@/lib/attendance/validate";

const context = { date: "2026-10-15", today: "2026-10-20", nowTime: "10:00" };

function check(body: unknown, ctx = context) {
  const parsed = parseRecordInput(body);
  if (!parsed.ok) return parsed;
  return validateRecordInput(parsed.value, ctx);
}

describe("勤怠修正の入力チェック", () => {
  it("正しい入力は通る", () => {
    const result = check({
      clockIn: "09:00",
      clockOut: "18:00",
      breaks: [{ start: "12:00", end: "13:00" }],
    });
    expect(result.ok).toBe(true);
  });

  it("退勤が出勤より前ならエラー", () => {
    const result = check({ clockIn: "18:00", clockOut: "09:00", breaks: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain("退勤時刻は出勤時刻より後にしてください。");
  });

  it("退勤と出勤が同じ時刻ならエラー", () => {
    expect(check({ clockIn: "09:00", clockOut: "09:00", breaks: [] }).ok).toBe(false);
  });

  it("時刻の書式が違えばエラー", () => {
    expect(check({ clockIn: "9時", clockOut: "18:00", breaks: [] }).ok).toBe(false);
    expect(check({ clockIn: "25:00", clockOut: "18:00", breaks: [] }).ok).toBe(false);
  });

  it("出勤なしで退勤だけはエラー", () => {
    expect(check({ clockIn: "", clockOut: "18:00", breaks: [] }).ok).toBe(false);
  });

  it("休憩が勤務時間の外ならエラー", () => {
    expect(
      check({ clockIn: "09:00", clockOut: "18:00", breaks: [{ start: "08:00", end: "09:30" }] }).ok,
    ).toBe(false);
    expect(
      check({ clockIn: "09:00", clockOut: "18:00", breaks: [{ start: "17:30", end: "18:30" }] }).ok,
    ).toBe(false);
  });

  it("休憩の終了が開始より前ならエラー", () => {
    expect(
      check({ clockIn: "09:00", clockOut: "18:00", breaks: [{ start: "13:00", end: "12:00" }] }).ok,
    ).toBe(false);
  });

  it("休憩どうしが重なればエラー", () => {
    const result = check({
      clockIn: "09:00",
      clockOut: "18:00",
      breaks: [
        { start: "12:00", end: "13:00" },
        { start: "12:30", end: "13:30" },
      ],
    });
    expect(result.ok).toBe(false);
  });

  it("退勤を空欄にすると打刻漏れのまま保存できる", () => {
    expect(check({ clockIn: "09:00", clockOut: "", breaks: [] }).ok).toBe(true);
  });

  it("すべて空なら削除として通る", () => {
    const result = check({ clockIn: "", clockOut: "", breaks: [] });
    expect(result).toEqual({ ok: true, value: { clockIn: null, clockOut: null, breaks: [] } });
  });

  it("未来の日付はエラー", () => {
    expect(
      check({ clockIn: "09:00", clockOut: "18:00", breaks: [] }, { ...context, date: "2026-10-21" })
        .ok,
    ).toBe(false);
  });

  it("今日の記録に現在より後の時刻はエラー", () => {
    expect(
      check({ clockIn: "09:00", clockOut: "18:00", breaks: [] }, { ...context, date: "2026-10-20" })
        .ok,
    ).toBe(false);
  });
});
