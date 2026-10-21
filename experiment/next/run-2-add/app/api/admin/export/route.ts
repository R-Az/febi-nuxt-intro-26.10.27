import type { NextRequest } from "next/server";
import { buildMonthlyCsv } from "@/lib/server/attendance";
import { requireAdmin } from "@/lib/server/auth";
import { jsonError, parseMonthParam } from "@/lib/server/http";

/** 勤怠のCSV出力。?month=YYYY-MM&userId=E001（全員は userId=all） */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const params = request.nextUrl.searchParams;
  const parsed = parseMonthParam(params.get("month"));
  if ("response" in parsed) return parsed.response;
  const userId = params.get("userId") || "all";

  const result = buildMonthlyCsv(parsed.month, userId);
  if (!result.ok) return jsonError(result.status, result.error);

  const filename = `attendance_${parsed.month}_${userId}.csv`;
  return new Response(result.value, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
