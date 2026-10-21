import { describe, expect, it } from "vitest";
import { msUntilNextJstMidnight } from "@/lib/time";
import { runDailyMissingCheck } from "@/server/missing-check";
import { listMissingLogs, saveRecord } from "@/server/store";

describe("毎日 0 時の打刻漏れ検出", () => {
  it("日本時間 0:00 に動くと、前日の退勤がない勤怠を記録する（同じものは重ねて記録しない）", () => {
    saveRecord({ userId: "E001", date: "2026-06-10", clockIn: 540, clockOut: null, breaks: [], updatedAt: "", updatedBy: "E001" });
    saveRecord({ userId: "E002", date: "2026-06-10", clockIn: 540, clockOut: 1080, breaks: [], updatedAt: "", updatedBy: "E002" });

    // 2026-06-11 00:00:01 JST = 2026-06-10 15:00:01 UTC
    const now = new Date("2026-06-10T15:00:01Z");
    const first = runDailyMissingCheck(now);
    expect(first.date).toBe("2026-06-10");
    expect(first.added.map((l) => [l.userId, l.clockIn, l.source])).toEqual([["E001", "09:00", "schedule"]]);

    const second = runDailyMissingCheck(now);
    expect(second.added).toEqual([]);
    expect(listMissingLogs().filter((l) => l.date === "2026-06-10")).toHaveLength(1);
  });

  it("次の日本時間 0:00 までの時間を求める", () => {
    // 2026-10-19 23:59:00 JST
    expect(msUntilNextJstMidnight(new Date("2026-10-19T14:59:00Z"))).toBe(60 * 1000);
    // 2026-10-20 00:00:00 JST ちょうどなら 24 時間後
    expect(msUntilNextJstMidnight(new Date("2026-10-19T15:00:00Z"))).toBe(24 * 60 * 60 * 1000);
  });
});
