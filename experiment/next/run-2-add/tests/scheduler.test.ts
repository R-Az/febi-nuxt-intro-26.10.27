import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/server/attendance", () => ({
  detectMissingPunches: vi.fn((targetDate: string, trigger: string) => ({
    ranAt: new Date().toISOString(),
    targetDate,
    trigger,
    foundCount: 0,
  })),
}));

const { detectMissingPunches } = await import("@/lib/server/attendance");
const { startMissingPunchScheduler } = await import("@/lib/server/scheduler");

afterEach(() => {
  vi.useRealTimers();
});

describe("打刻漏れ検出の定期処理", () => {
  it("起動時に前日分を検出し、日本時間0時に前日分を検出する", () => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    // 日本時間 2026-10-20 23:59:00
    vi.setSystemTime(new Date("2026-10-20T14:59:00Z"));

    startMissingPunchScheduler();
    expect(detectMissingPunches).toHaveBeenCalledTimes(1);
    expect(detectMissingPunches).toHaveBeenLastCalledWith("2026-10-19", "startup");

    // 0時の直前ではまだ動かない
    vi.advanceTimersByTime(59 * 1000);
    expect(detectMissingPunches).toHaveBeenCalledTimes(1);

    // 0時を過ぎると、終わった日（10/20）を検出する
    vi.advanceTimersByTime(2 * 1000);
    expect(detectMissingPunches).toHaveBeenCalledTimes(2);
    expect(detectMissingPunches).toHaveBeenLastCalledWith("2026-10-20", "schedule");

    // 翌日の0時にも動く
    vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    expect(detectMissingPunches).toHaveBeenCalledTimes(3);
    expect(detectMissingPunches).toHaveBeenLastCalledWith("2026-10-21", "schedule");
  });

  it("2回呼んでも二重に起動しない", () => {
    vi.useFakeTimers();
    const before = vi.mocked(detectMissingPunches).mock.calls.length;
    startMissingPunchScheduler();
    expect(vi.mocked(detectMissingPunches).mock.calls.length).toBe(before);
  });
});
