import { NextResponse, type NextRequest } from "next/server";
import { currentMonthInJst, isValidMonth, todayInJst } from "@/lib/time";
import { getMonthlyAttendance } from "@/server/attendance-service";
import { jsonError, requireUser } from "@/server/http";
import { listEmployees } from "@/server/store";

/** 全従業員の月次集計（管理者のみ）。 */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request, "admin");
  if (auth.response) return auth.response;

  const month = request.nextUrl.searchParams.get("month") ?? currentMonthInJst();
  if (!isValidMonth(month)) return jsonError(400, "月は YYYY-MM の形式で指定してください。");

  const today = todayInJst();
  const summaries = listEmployees().map((user) => ({
    user,
    totals: getMonthlyAttendance(user.id, month, today).totals,
  }));
  return NextResponse.json({ month, summaries });
}
