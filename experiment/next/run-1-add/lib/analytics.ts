// Google Analytics（gtag.js）の同意管理とイベント送信（ブラウザでだけ使う）。
// 利用者が同意するまでは gtag.js を読み込まず、dataLayer も作らないので、計測は一切送らない。

import { PUNCH_LABEL } from "./punch";
import type { PunchAction } from "./types";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

export type AnalyticsConsent = "granted" | "denied";

const CONSENT_KEY = "analytics-consent";
const CONSENT_EVENT = "analytics-consent-change";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

/** 保存された同意の状態。まだ選んでいなければ null。 */
export function getConsent(): AnalyticsConsent | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    // プライベートモードなどで localStorage が使えないときは、未選択として扱う
    return null;
  }
}

export function setConsent(consent: AnalyticsConsent): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, consent);
  } catch {
    // 保存できなくても、この画面を開いている間は選んだ状態で動かす
  }
  window.dispatchEvent(new CustomEvent<AnalyticsConsent>(CONSENT_EVENT, { detail: consent }));
}

/** 同意の状態の変化を購読する（useSyncExternalStore 用）。別のタブでの変更も拾う。 */
export function subscribeConsent(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => e.key === CONSENT_KEY && onChange();
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * gtag を用意して初期設定を積む。同意したあとに一度だけ呼ぶ。
 * gtag.js 本体は、この後に読み込まれたときに dataLayer に積まれた命令を順に送る。
 */
export function initAnalytics(measurementId: string = GA_MEASUREMENT_ID): void {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  // gtag.js は配列ではなく arguments オブジェクトが積まれることを前提にしている
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  // 同意を得たのはアクセス解析だけなので、広告に関わる保存・利用は拒否のままにする
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
}

/** 打刻したことを送る。同意していなければ何もしない。 */
export function trackPunch(action: PunchAction): void {
  if (getConsent() !== "granted" || !window.gtag) return;
  window.gtag("event", "punch", {
    punch_type: PUNCH_LABEL[action],
    punch_action: action,
  });
}
