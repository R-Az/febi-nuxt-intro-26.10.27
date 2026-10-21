import { NextResponse, type NextRequest } from "next/server";
import { currentMonthInJst, isValidMonth, todayInJst } from "@/lib/time";
import { getMonthlyAttendance } from "@/server/attendance-service";
import { jsonError, requireUser } from "@/server/http";
import { findUserById, toPublicUser } from "@/server/store";

/**
 * 月ごとの勤怠一覧と合計。
 * - month: YYYY-MM（省略時は今月）
 * - userId: 対象の従業員。従業員は自分の ID のみ指定でき、他人を指定すると 403。管理者は必須。
 */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;

  const params = request.nextUrl.searchParams;
  const month = params.get("month") ?? currentMonthInJst();
  if (!isValidMonth(month)) return jsonError(400, "月は YYYY-MM の形式で指定してください。");

  const requestedId = params.get("userId");
  let targetId: string;
  if (auth.user.role === "employee") {
    if (requestedId && requestedId !== auth.user.id) {
      return jsonError(403, "他の従業員の勤怠は見られません。");
    }
    targetId = auth.user.id;
  } else {
    if (!requestedId) return jsonError(400, "従業員を指定してください。");
    targetId = requestedId;
  }

  const target = findUserById(targetId);
  if (!target || target.role !== "employee") return jsonError(404, "従業員が見つかりません。");

  const today = todayInJst();
  return NextResponse.json({
    user: toPublicUser(target),
    month,
    today,
    ...getMonthlyAttendance(target.id, month, today),
  });
}
