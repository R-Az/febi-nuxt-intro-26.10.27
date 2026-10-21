import type { NextRequest } from "next/server";
import { updateRecord } from "@/lib/server/attendance";
import { requireAdmin } from "@/lib/server/auth";
import { findUserById } from "@/lib/server/db";
import { jsonError, parseDateParam, readJson } from "@/lib/server/http";

/**
 * 管理者による勤怠の修正。
 * body: { clockIn: "HH:MM" | null, clockOut: "HH:MM" | null, breaks: { start, end }[] }
 * すべて空なら、その日の記録を削除する。
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/attendance/[userId]/[date]">,
) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { userId, date: rawDate } = await ctx.params;
  const parsedDate = parseDateParam(rawDate);
  if ("response" in parsedDate) return parsedDate.response;

  const user = findUserById(userId);
  if (!user || user.role !== "employee") return jsonError(404, "従業員が見つかりません。");

  const result = updateRecord(userId, parsedDate.date, await readJson(request));
  if (!result.ok) return jsonError(result.status, result.error, result.details);
  return Response.json({ record: result.value });
}
