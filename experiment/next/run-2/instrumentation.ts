// サーバー起動時に1回だけ呼ばれる。打刻漏れ検出の定期処理をここで始める。

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { startMissingPunchScheduler } = await import("@/lib/server/scheduler");
  startMissingPunchScheduler();
}
