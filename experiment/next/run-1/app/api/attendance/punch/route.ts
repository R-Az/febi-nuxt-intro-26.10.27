import { NextResponse, type NextRequest } from "next/server";
import { allowedActions, applyPunch, getPunchState } from "@/lib/punch";
import { formatTime, nowInJst } from "@/lib/time";
import type { PunchAction } from "@/lib/types";
import { toRow } from "@/server/attendance-service";
import { jsonError, readJson, requireUser } from "@/server/http";
import { getRecord, saveRecord } from "@/server/store";

const ACTIONS: PunchAction[] = ["clock_in", "break_start", "break_end", "clock_out"];

/** 打刻する（従業員のみ）。時刻はサーバーの現在時刻（日本時間・分単位）を使う。 */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request, "employee");
  if (auth.response) return auth.response;

  const body = await readJson(request);
  const action = typeof body === "object" && body !== null ? (body as Record<string, unknown>).action : undefined;
  if (typeof action !== "string" || !ACTIONS.includes(action as PunchAction)) {
    return jsonError(400, "打刻の種類が正しくありません。");
  }

  const { date, minutes } = nowInJst();
  const current = getRecord(auth.user.id, date);
  const result = applyPunch(current, action as PunchAction, minutes);
  if (!result.ok) return jsonError(409, result.error);

  const saved = saveRecord({
    userId: auth.user.id,
    date,
    ...result.record,
    updatedAt: new Date().toISOString(),
    updatedBy: auth.user.id,
  });
  const state = getPunchState(saved);
  return NextResponse.json({
    date,
    now: formatTime(minutes),
    state,
    allowedActions: allowedActions(state),
    record: toRow(saved, date),
  });
}
