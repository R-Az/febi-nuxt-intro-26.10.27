// Google Analytics の同意状態と、イベントの送信。
// 同意するまでは gtag.js を読み込まず、イベントも送らない（Consent Mode の「拒否」状態の通信も出さない）。

import { sendGAEvent } from "@next/third-parties/google";
import { PUNCH_LABELS } from "@/lib/attendance/punch";
import type { PunchType } from "@/lib/types";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-XXXXXXXXXX";

/** granted: 同意した / denied: 同意しない / unset: まだ選んでいない */
export type AnalyticsConsent = "granted" | "denied" | "unset";

const STORAGE_KEY = "analytics-consent";
const listeners = new Set<() => void>();

function readConsent(): AnalyticsConsent {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : "unset";
  } catch {
    // localStorage が使えない環境（プライベートモードの一部など）では毎回たずねる
    return "unset";
  }
}

let current: AnalyticsConsent | null = null;

/** useSyncExternalStore 用。 */
export function getConsent(): AnalyticsConsent {
  if (current === null) {
    current = readConsent();
    if (current === "granted") initConsentMode();
  }
  return current;
}

/** サーバーでは同意状態が分からないので、バナーも計測も出さない値を返す。 */
export function getServerConsent(): AnalyticsConsent | null {
  return null;
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setConsent(value: Exclude<AnalyticsConsent, "unset">) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // 保存できなくても、この画面を開いている間は選んだ値で動かす
  }
  current = value;
  if (value === "granted") initConsentMode();
  listeners.forEach((listener) => listener());
}

type GtagArgs = ["consent", "default" | "update", Record<string, string>];

/** gtag() と同じ形（arguments オブジェクト）で dataLayer に積む。gtag.js は配列ではなく arguments を期待する。 */
function gtag(..._args: GtagArgs): void;
function gtag() {
  window.dataLayer = window.dataLayer ?? [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

let consentModeInitialized = false;

/**
 * 同意が分かった時点（gtag.js を読み込むより前）に一度だけ呼ぶ。
 * 計測（analytics_storage）は同意済みなので許可し、同意を取っていない広告用の項目は拒否のままにする。
 */
function initConsentMode() {
  if (consentModeInitialized) return;
  consentModeInitialized = true;
  gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

/** 打刻イベント「punch」を送る。同意していなければ何もしない。 */
export function trackPunch(type: PunchType) {
  if (typeof window === "undefined" || getConsent() !== "granted") return;
  sendGAEvent("event", "punch", { punch_type: type, punch_label: PUNCH_LABELS[type] });
}
