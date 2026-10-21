import { NextResponse, type NextRequest } from "next/server";
import { isValidDate, todayInJst } from "@/lib/time";
import { isAttendanceEditInput, validateAttendanceEdit } from "@/lib/validation";
import { toRow } from "@/server/attendance-service";
import { jsonError, readJson, requireUser } from "@/server/http";
import { deleteRecord, findUserById, saveRecord } from "@/server/store";

/**
 * 任意の従業員・任意の日の勤怠を修正する（管理者のみ）。
 * 本文: { userId, date, clockIn: "HH:MM", clockOut: "HH:MM" | "", breaks: [{ start, end }] }
 * 出勤・退勤・休憩をすべて空にすると、その日の勤怠を削除する。
 */
export async function PUT(request: NextRequest) {
  const auth = await requireUser(request, "admin");
  if (auth.response) return auth.response;

  const body = await readJson(request);
  if (typeof body !== "object" || body === null) return jsonError(400, "入力が正しくありません。");
  const { userId, date } = body as Record<string, unknown>;
  if (typeof userId !== "string" || typeof date !== "string" || !isAttendanceEditInput(body)) {
    return jsonError(400, "入力が正しくありません。");
  }
  if (!isValidDate(date)) return jsonError(400, "日付は YYYY-MM-DD の形式で指定してください。");

  const today = todayInJst();
  if (date > today) return jsonError(400, "未来の日付の勤怠は修正できません。");

  const target = findUserById(userId);
  if (!target || target.role !== "employee") return jsonError(404, "従業員が見つかりません。");

  const result = validateAttendanceEdit(body);
  if (!result.ok) return jsonError(400, "入力内容に誤りがあります。", result.errors);

  if (result.action === "delete") {
    deleteRecord(userId, date);
    return NextResponse.json({ row: null });
  }

  const saved = saveRecord({
    userId,
    date,
    clockIn: result.clockIn,
    clockOut: result.clockOut,
    breaks: result.breaks,
    updatedAt: new Date().toISOString(),
    updatedBy: auth.user.id,
  });
  return NextResponse.json({ row: toRow(saved, today) });
}
