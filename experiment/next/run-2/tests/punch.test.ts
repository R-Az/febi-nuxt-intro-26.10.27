import { describe, expect, it } from "vitest";
import { allowedPunches, applyPunch, getPunchState } from "@/lib/attendance/punch";
import type { AttendanceRecord, PunchType } from "@/lib/types";

const params = { userId: "E001", date: "2026-10-20" };

function run(types: PunchType[]): AttendanceRecord | null {
  let current: AttendanceRecord | null = null;
  types.forEach((type, i) => {
    const result = applyPunch(current, type, { ...params, time: `1${i}:00` });
    if (!result.ok) throw new Error(result.error);
    current = result.record;
  });
  return current;
}

describe("打刻の状態遷移", () => {
  it("出勤前は出勤だけ押せる", () => {
    expect(getPunchState(null)).toBe("not_started");
    expect(allowedPunches("not_started")).toEqual(["clock_in"]);
  });

  it("出勤→休憩開始→休憩終了→退勤の順に打刻できる", () => {
    const record = run(["clock_in", "break_start", "break_end", "clock_out"]);
    expect(record).toEqual({
      ...params,
      clockIn: "10:00",
      clockOut: "13:00",
      breaks: [{ start: "11:00", end: "12:00" }],
    });
    expect(getPunchState(record)).toBe("finished");
    expect(allowedPunches("finished")).toEqual([]);
  });

  it("出勤前の退勤はできない", () => {
    const result = applyPunch(null, "clock_out", { ...params, time: "18:00" });
    expect(result.ok).toBe(false);
  });

  it("二重の出勤はできない", () => {
    const result = applyPunch(run(["clock_in"]), "clock_in", { ...params, time: "10:00" });
    expect(result.ok).toBe(false);
  });

  it("休憩中は退勤できない", () => {
    const record = run(["clock_in", "break_start"]);
    expect(getPunchState(record)).toBe("on_break");
    expect(applyPunch(record, "clock_out", { ...params, time: "18:00" }).ok).toBe(false);
  });

  it("休憩していないのに休憩終了はできない", () => {
    expect(applyPunch(run(["clock_in"]), "break_end", { ...params, time: "12:00" }).ok).toBe(false);
  });

  it("元の記録は書き換えない", () => {
    const before = run(["clock_in", "break_start"])!;
    const snapshot = structuredClone(before);
    applyPunch(before, "break_end", { ...params, time: "13:00" });
    expect(before).toEqual(snapshot);
  });
});
