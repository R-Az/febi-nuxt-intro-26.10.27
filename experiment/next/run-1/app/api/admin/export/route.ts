import type { NextRequest } from "next/server";
import { buildAttendanceCsv } from "@/lib/csv";
import { isValidMonth, todayInJst } from "@/lib/time";
import { jsonError, requireUser } from "@/server/http";
import { findUserById, listEmployees, listRecordsByMonth } from "@/server/store";

/**
 * 勤怠を CSV で出力する（管理者のみ）。
 * - month: YYYY-MM（必須）
 * - userId: 従業員 ID、または "all"（全員）
 */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request, "admin");
  if (auth.response) return auth.response;

  const params = request.nextUrl.searchParams;
  const month = params.get("month") ?? "";
  if (!isValidMonth(month)) return jsonError(400, "月は YYYY-MM の形式で指定してください。");

  const userId = params.get("userId") ?? "all";
  let targets;
  if (userId === "all") {
    targets = listEmployees();
  } else {
    const user = findUserById(userId);
    if (!user || user.role !== "employee") return jsonError(404, "従業員が見つかりません。");
    targets = [user];
  }

  const rows = targets.flatMap((u) =>
    listRecordsByMonth(u.id, month).map((record) => ({ userId: u.id, userName: u.name, record })),
  );
  const csv = buildAttendanceCsv(rows, todayInJst());
  const filename = `attendance_${month}_${userId}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
