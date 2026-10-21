import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendGAEvent = vi.fn();
vi.mock("@next/third-parties/google", () => ({ sendGAEvent }));

function stubBrowser(saved: Record<string, string> = {}) {
  const store = new Map(Object.entries(saved));
  const window = {
    dataLayer: undefined as unknown[] | undefined,
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    },
  };
  vi.stubGlobal("window", window);
  return { window, store };
}

async function load() {
  return import("@/lib/client/analytics");
}

beforeEach(() => {
  vi.resetModules();
  sendGAEvent.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("アクセス解析の同意", () => {
  it("まだ選んでいなければ unset で、打刻イベントも送らない", async () => {
    const { window } = stubBrowser();
    const analytics = await load();
    expect(analytics.getConsent()).toBe("unset");
    analytics.trackPunch("clock_in");
    expect(sendGAEvent).not.toHaveBeenCalled();
    expect(window.dataLayer).toBeUndefined();
  });

  it("同意しないを選ぶと保存され、打刻イベントは送らない", async () => {
    const { store } = stubBrowser();
    const analytics = await load();
    analytics.setConsent("denied");
    expect(store.get("analytics-consent")).toBe("denied");
    expect(analytics.getConsent()).toBe("denied");
    analytics.trackPunch("clock_out");
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it("同意すると変更が通知され、Consent Mode の初期値を積んでから打刻イベントを送る", async () => {
    const { window, store } = stubBrowser();
    const analytics = await load();
    const listener = vi.fn();
    analytics.subscribeConsent(listener);

    analytics.setConsent("granted");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.get("analytics-consent")).toBe("granted");
    expect(window.dataLayer?.map((args) => Array.from(args as IArguments))).toEqual([
      [
        "consent",
        "default",
        {
          analytics_storage: "granted",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        },
      ],
    ]);

    analytics.trackPunch("break_start");
    expect(sendGAEvent).toHaveBeenCalledWith("event", "punch", {
      punch_type: "break_start",
      punch_label: "休憩開始",
    });
  });

  it("以前に同意していれば、読み込み時に同意済みとして扱う", async () => {
    const { window } = stubBrowser({ "analytics-consent": "granted" });
    const analytics = await load();
    expect(analytics.getConsent()).toBe("granted");
    expect(window.dataLayer).toHaveLength(1);
    analytics.trackPunch("clock_out");
    expect(sendGAEvent).toHaveBeenCalledWith("event", "punch", {
      punch_type: "clock_out",
      punch_label: "退勤",
    });
  });
});
