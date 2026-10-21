// 常駐サーバー（next dev / next start）の中で、毎日 0 時（日本時間）に打刻漏れ検出を動かすスケジューラ。
// instrumentation.ts の register() から 1 度だけ起動する。

import { msUntilNextJstMidnight } from "@/lib/time";
import { runDailyMissingCheck } from "./missing-check";

const globalScheduler = globalThis as typeof globalThis & { __kintaiSchedulerStarted?: boolean };

export function startDailyScheduler(): void {
  if (globalScheduler.__kintaiSchedulerStarted) return;
  globalScheduler.__kintaiSchedulerStarted = true;

  const scheduleNext = () => {
    // 0:00 ちょうどに起きると前日扱いになる誤差を避けるため、少し遅らせる
    const timer = setTimeout(() => {
      try {
        runDailyMissingCheck();
      } catch (error) {
        console.error("[missing-check] 打刻漏れの検出に失敗しました", error);
      }
      scheduleNext();
    }, msUntilNextJstMidnight() + 1000);
    // このタイマーだけでプロセスが終わらなくならないようにする
    timer.unref();
  };
  scheduleNext();
  console.log("[missing-check] 毎日 0:00（日本時間）の打刻漏れ検出を登録しました");
}
