import type { NextRequest } from "next/server";
import {
  detectMissingPunches,
  getMissingPunchReport,
} from "@/lib/server/attendance";
import { requireAdmin } from "@/lib/server/auth";
import { jsonError, parseDateParam, readJson } from "@/lib/server/http";
import { addDays, nowInTokyo } from "@/lib/time";

/** 定期処理で検出した打刻漏れと、処理の実行履歴。 */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;
  return Response.json(getMissingPunchReport());
}

/** 検出を手動で実行する。body: { date?: "YYYY-MM-DD" }（省略時は前日） */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await readJson(request)) as { date?: unknown } | undefined;
  const today = nowInTokyo().date;
  let target = addDays(today, -1);
  if (body?.date !== undefined && body.date !== "") {
    if (typeof body.date !== "string") return jsonError(400, "日付の形式が正しくありません。");
    const parsed = parseDateParam(body.date);
    if ("response" in parsed) return parsed.response;
    if (parsed.date >= today) return jsonError(400, "検出できるのは昨日以前の日付です。");
    target = parsed.date;
  }

  const run = detectMissingPunches(target, "manual");
  return Response.json({ run, ...getMissingPunchReport() });
}
