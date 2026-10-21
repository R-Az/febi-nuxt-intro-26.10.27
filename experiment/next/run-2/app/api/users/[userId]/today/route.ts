import type { NextRequest } from "next/server";
import { getTodayStatus } from "@/lib/server/attendance";
import { requireSelfOrAdmin } from "@/lib/server/auth";
import { findUserById } from "@/lib/server/db";
import { jsonError } from "@/lib/server/http";

/** 今日の打刻状態と、今押せる打刻の種類。 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]/today">,
) {
  const { userId } = await ctx.params;
  const auth = requireSelfOrAdmin(request, userId);
  if (!auth.ok) return auth.response;

  const user = findUserById(userId);
  if (!user || user.role !== "employee") return jsonError(404, "従業員が見つかりません。");

  return Response.json(getTodayStatus(userId));
}
