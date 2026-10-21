import type { NextRequest } from "next/server";
import { getMonthlySummaries } from "@/lib/server/attendance";
import { requireAdmin } from "@/lib/server/auth";
import { parseMonthParam } from "@/lib/server/http";

/** 全従業員の月次集計。 */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const parsed = parseMonthParam(request.nextUrl.searchParams.get("month"));
  if ("response" in parsed) return parsed.response;

  return Response.json({ month: parsed.month, summaries: getMonthlySummaries(parsed.month) });
}
