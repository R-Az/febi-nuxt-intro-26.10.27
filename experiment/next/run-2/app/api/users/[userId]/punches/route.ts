import type { NextRequest } from "next/server";
import { isPunchType } from "@/lib/attendance/punch";
import { punch } from "@/lib/server/attendance";
import { requireSelfEmployee } from "@/lib/server/auth";
import { jsonError, readJson } from "@/lib/server/http";

/**
 * 打刻する。body: { type: "clock_in" | "break_start" | "break_end" | "clock_out" }
 * 時刻はサーバーの現在時刻（日本時間・分単位）を使う。今の状態で押せない打刻は 409。
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]/punches">,
) {
  const { userId } = await ctx.params;
  const auth = requireSelfEmployee(request, userId);
  if (!auth.ok) return auth.response;

  const body = (await readJson(request)) as { type?: unknown } | undefined;
  if (!isPunchType(body?.type)) {
    return jsonError(400, "打刻の種類が正しくありません。");
  }

  const result = punch(userId, body.type);
  if (!result.ok) return jsonError(result.status, result.error);
  return Response.json(result.value);
}
