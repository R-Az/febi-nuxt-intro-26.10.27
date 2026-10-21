import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getConsent, initAnalytics, setConsent, trackPunch } from "@/lib/analytics";

type FakeWindow = {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  localStorage: Pick<Storage, "getItem" | "setItem">;
  dispatchEvent: (e: Event) => boolean;
};

let win: FakeWindow;

beforeEach(() => {
  const store = new Map<string, string>();
  win = {
    localStorage: {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => void store.set(k, v),
    },
    dispatchEvent: () => true,
  };
  vi.stubGlobal("window", win);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** dataLayer に積まれた命令を配列にして返す（gtag は arguments オブジェクトを積む） */
function commands(): unknown[][] {
  return (win.dataLayer ?? []).map((args) => Array.from(args as ArrayLike<unknown>));
}

describe("同意の状態", () => {
  it("まだ選んでいなければ null", () => {
    expect(getConsent()).toBeNull();
  });

  it("選んだ状態を保存して読み出せる", () => {
    setConsent("granted");
    expect(getConsent()).toBe("granted");
    setConsent("denied");
    expect(getConsent()).toBe("denied");
  });

  it("想定外の値が保存されていたら未選択として扱う", () => {
    win.localStorage.setItem("analytics-consent", "yes");
    expect(getConsent()).toBeNull();
  });
});

describe("打刻イベント", () => {
  it("同意する前は何も送らない（dataLayer も作らない）", () => {
    trackPunch("clock_in");
    expect(win.dataLayer).toBeUndefined();
  });

  it("同意しなかったら何も送らない", () => {
    setConsent("denied");
    trackPunch("clock_in");
    expect(win.dataLayer).toBeUndefined();
  });

  it("同意したら、初期設定のあとに punch イベントを種類つきで送る", () => {
    setConsent("granted");
    initAnalytics("G-TEST");
    trackPunch("break_start");

    const sent = commands();
    expect(sent).toContainEqual(["config", "G-TEST"]);
    expect(sent.at(-1)).toEqual(["event", "punch", { punch_type: "休憩開始", punch_action: "break_start" }]);
  });

  it("4 種類の打刻をそれぞれの名前で送る", () => {
    setConsent("granted");
    initAnalytics("G-TEST");
    trackPunch("clock_in");
    trackPunch("break_start");
    trackPunch("break_end");
    trackPunch("clock_out");

    const types = commands()
      .filter((c) => c[0] === "event" && c[1] === "punch")
      .map((c) => (c[2] as { punch_type: string }).punch_type);
    expect(types).toEqual(["出勤", "休憩開始", "休憩終了", "退勤"]);
  });

  it("初期設定は一度だけ行う", () => {
    setConsent("granted");
    initAnalytics("G-TEST");
    initAnalytics("G-TEST");
    expect(commands().filter((c) => c[0] === "config")).toHaveLength(1);
  });
});
