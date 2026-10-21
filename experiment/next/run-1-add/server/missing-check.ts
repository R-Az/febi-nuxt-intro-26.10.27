// 毎日 0 時に動く「前日の打刻漏れ検出」の本体。スケジューラと cron 用 API の両方から呼ぶ。

import { addDays, todayInJst } from "@/lib/time";
import type { MissingClockOutLog } from "@/lib/types";
import { detectMissingClockOuts } from "./store";

export function runDailyMissingCheck(now: Date = new Date()): { date: string; added: MissingClockOutLog[] } {
  const date = addDays(todayInJst(now), -1);
  const added = detectMissingClockOuts(date, "schedule", now);
  console.log(`[missing-check] ${date} の打刻漏れを検出しました: ${added.length} 件`);
  return { date, added };
}
