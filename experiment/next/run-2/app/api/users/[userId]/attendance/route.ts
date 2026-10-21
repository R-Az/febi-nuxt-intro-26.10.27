import type { NextRequest } from "next/server";
import { getMonthlyAttendance } from "@/lib/server/attendance";
import { requireSelfOrAdmin } from "@/lib/server/auth";
import { findUserById } from "@/lib/server/db";
import { jsonError, parseMonthParam } from "@/lib/server/http";

/** 指定した従業員の月の勤怠一覧。本人か管理者だけが読める。 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]/attendance">,
) {
  const { userId } = await ctx.params;
  const auth = requireSelfOrAdmin(request, userId);
  if (!auth.ok) return auth.response;

  const parsed = parseMonthParam(request.nextUrl.searchParams.get("month"));
  if ("response" in parsed) return parsed.response;

  const user = findUserById(userId);
  if (!user || user.role !== "employee") return jsonError(404, "従業員が見つかりません。");

  return Response.json(getMonthlyAttendance(user, parsed.month));
}
