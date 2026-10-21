import { NextResponse, type NextRequest } from "next/server";
import { allowedActions, getPunchState } from "@/lib/punch";
import { formatTime, nowInJst } from "@/lib/time";
import { toRow } from "@/server/attendance-service";
import { requireUser } from "@/server/http";
import { getRecord } from "@/server/store";

/** 今日の打刻状況と、今押せる打刻の種類を返す（従業員のみ）。 */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request, "employee");
  if (auth.response) return auth.response;

  const { date, minutes } = nowInJst();
  const record = getRecord(auth.user.id, date);
  const state = getPunchState(record);
  return NextResponse.json({
    date,
    now: formatTime(minutes),
    state,
    allowedActions: allowedActions(state),
    record: record ? toRow(record, date) : null,
  });
}
