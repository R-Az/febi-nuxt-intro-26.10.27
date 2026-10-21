import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { toPublicUser } from "@/lib/server/db";
import { nowInTokyo } from "@/lib/time";

/** ログイン中のユーザーと、サーバー基準の今日の日付（日本時間）。 */
export async function GET(request: NextRequest) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;
  return Response.json({ user: toPublicUser(auth.user), today: nowInTokyo().date });
}
