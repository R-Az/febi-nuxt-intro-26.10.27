import { NextResponse, type NextRequest } from "next/server";
import { addDays, isValidDate, todayInJst } from "@/lib/time";
import { jsonError, readJson, requireUser } from "@/server/http";
import { detectMissingClockOuts, getRecord, listMissingLogs } from "@/server/store";

/** 検出した打刻漏れの一覧（管理者のみ）。今も退勤が空のままかどうかも返す。 */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request, "admin");
  if (auth.response) return auth.response;

  const logs = listMissingLogs().map((log) => {
    const record = getRecord(log.userId, log.date);
    return { ...log, resolved: !record || record.clockOut !== null };
  });
  return NextResponse.json({ logs });
}

/** 指定した日（省略時は前日）の打刻漏れ検出を手動で実行する（管理者のみ）。 */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request, "admin");
  if (auth.response) return auth.response;

  const body = await readJson(request);
  const today = todayInJst();
  const requested = typeof body === "object" && body !== null ? (body as Record<string, unknown>).date : undefined;
  const date = typeof requested === "string" && requested !== "" ? requested : addDays(today, -1);
  if (!isValidDate(date)) return jsonError(400, "日付は YYYY-MM-DD の形式で指定してください。");
  if (date >= today) return jsonError(400, "検出できるのは昨日以前の日付です。");

  const added = detectMissingClockOuts(date, "manual");
  return NextResponse.json({ date, added });
}
