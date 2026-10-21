import { connection, type NextRequest } from "next/server";
import { detectMissingPunches } from "@/lib/server/attendance";
import { jsonError } from "@/lib/server/http";
import { addDays, nowInTokyo } from "@/lib/time";

/**
 * 外部のスケジューラ（OS の cron など）から前日の打刻漏れ検出を起動するための入口。
 * 通常はアプリ内のスケジューラ（instrumentation.ts）が毎日0時に実行するので不要。
 * 環境変数 CRON_SECRET を設定したときだけ有効で、`Authorization: Bearer <CRON_SECRET>` が必要。
 */
export async function GET(request: NextRequest) {
  // 環境変数は実行時に読む（ビルド時の値で静的なレスポンスにしない）。
  await connection();
  const secret = process.env.CRON_SECRET;
  if (!secret) return jsonError(404, "Not Found");
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return jsonError(401, "認証に失敗しました。");
  }
  const target = addDays(nowInTokyo().date, -1);
  return Response.json({ run: detectMissingPunches(target, "external") });
}
