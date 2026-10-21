import { describe, expect, it } from "vitest";
import { msUntilNextTokyoMidnight, nowInTokyo } from "@/lib/time";

describe("日本時間の扱い", () => {
  it("UTC 15:00 は日本時間の翌日0時", () => {
    expect(nowInTokyo(new Date("2026-10-19T15:00:30Z"))).toEqual({
      date: "2026-10-20",
      time: "00:00",
    });
  });

  it("秒は切り捨てて分単位にする", () => {
    expect(nowInTokyo(new Date("2026-10-20T00:59:59Z")).time).toBe("09:59");
  });

  it("次の日本時間0時までのミリ秒を返す", () => {
    // 日本時間 2026-10-20 23:30 → 30分後が0時
    expect(msUntilNextTokyoMidnight(new Date("2026-10-20T14:30:00Z"))).toBe(30 * 60 * 1000);
    // 日本時間 0時ちょうど → 24時間後
    expect(msUntilNextTokyoMidnight(new Date("2026-10-19T15:00:00Z"))).toBe(24 * 60 * 60 * 1000);
  });
});
