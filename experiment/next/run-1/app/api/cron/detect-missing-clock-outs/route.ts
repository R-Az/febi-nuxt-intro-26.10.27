import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/server/http";
import { runDailyMissingCheck } from "@/server/missing-check";

/**
 * 外部のスケジューラ（Vercel Cron など）から毎日 0 時（日本時間）に呼ぶための API。
 * 環境変数 CRON_SECRET を設定し、`Authorization: Bearer <CRON_SECRET>` を付けて呼ぶ。
 * 常駐サーバー（next start / next dev）では instrumentation.ts のスケジューラが同じ処理を動かすので、これは不要。
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return jsonError(401, "認証に失敗しました。");
  }
  const result = runDailyMissingCheck();
  return NextResponse.json(result);
}
