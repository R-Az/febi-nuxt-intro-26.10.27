import { describe, expect, it } from "vitest";
import { allowedActions, applyPunch, getPunchState } from "@/lib/punch";

describe("打刻の状態遷移", () => {
  it("出勤 → 休憩開始 → 休憩終了 → 退勤 の順に打刻できる", () => {
    let r = applyPunch(null, "clock_in", 540);
    expect(r.ok && getPunchState(r.record)).toBe("working");
    r = applyPunch(r.ok ? r.record : null, "break_start", 720);
    expect(r.ok && getPunchState(r.record)).toBe("on_break");
    r = applyPunch(r.ok ? r.record : null, "break_end", 780);
    expect(r.ok && getPunchState(r.record)).toBe("working");
    r = applyPunch(r.ok ? r.record : null, "clock_out", 1080);
    expect(r.ok && r.record).toEqual({ clockIn: 540, clockOut: 1080, breaks: [{ start: 720, end: 780 }] });
  });

  it("出勤前の退勤・休憩はできない", () => {
    expect(applyPunch(null, "clock_out", 600).ok).toBe(false);
    expect(applyPunch(null, "break_start", 600).ok).toBe(false);
  });

  it("二重の出勤はできない", () => {
    expect(applyPunch({ clockIn: 540, clockOut: null, breaks: [] }, "clock_in", 600).ok).toBe(false);
  });

  it("休憩中は退勤できない", () => {
    expect(applyPunch({ clockIn: 540, clockOut: null, breaks: [{ start: 720, end: null }] }, "clock_out", 800).ok).toBe(
      false,
    );
  });

  it("退勤後は何も打刻できない", () => {
    expect(allowedActions(getPunchState({ clockIn: 540, clockOut: 1080, breaks: [] }))).toEqual([]);
  });
});
