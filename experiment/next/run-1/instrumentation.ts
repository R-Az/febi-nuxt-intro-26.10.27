// サーバー起動時に 1 度だけ呼ばれる。毎日 0 時の打刻漏れ検出スケジューラをここで起動する。

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const { startDailyScheduler } = await import("./server/scheduler");
  startDailyScheduler();
}
