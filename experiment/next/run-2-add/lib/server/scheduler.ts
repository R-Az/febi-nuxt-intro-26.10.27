import "server-only";
// 打刻漏れ検出の定期処理（受け入れ条件9）。
// instrumentation.ts の register() からサーバー起動時に1回だけ呼ばれ、毎日0時（日本時間）に前日分を検出する。
// データがこのプロセスのメモリ上にあるため、外部のスケジューラではなく同じプロセス内のタイマーで動かす。

import { detectMissingPunches } from "@/lib/server/attendance";
import { addDays, msUntilNextTokyoMidnight, nowInTokyo } from "@/lib/time";

// 0時ちょうどより少し早く発火しても前日扱いにならないよう、1秒遅らせる。
const FIRE_DELAY_MS = 1000;

const globalForScheduler = globalThis as typeof globalThis & {
  __missingPunchScheduler?: { timer: NodeJS.Timeout | null };
};

function scheduleNext(state: { timer: NodeJS.Timeout | null }) {
  // 次の0時で終わる日（＝今日）が検出対象になる。
  const targetDate = nowInTokyo().date;
  const delay = msUntilNextTokyoMidnight() + FIRE_DELAY_MS;
  state.timer = setTimeout(() => {
    try {
      const run = detectMissingPunches(targetDate, "schedule");
      console.log(`[打刻漏れ検出] ${run.targetDate}: ${run.foundCount}件`);
    } catch (error) {
      console.error("[打刻漏れ検出] 失敗しました", error);
    }
    scheduleNext(state);
  }, delay);
  // このタイマーだけが残ってプロセスが終われなくなることを防ぐ。
  state.timer.unref();
}

export function startMissingPunchScheduler(): void {
  if (globalForScheduler.__missingPunchScheduler) return;
  const state = { timer: null };
  globalForScheduler.__missingPunchScheduler = state;

  // サーバーが止まっていて0時の実行を逃した場合に備え、起動時にも前日分を検出する。
  const yesterday = addDays(nowInTokyo().date, -1);
  detectMissingPunches(yesterday, "startup");

  scheduleNext(state);
}
