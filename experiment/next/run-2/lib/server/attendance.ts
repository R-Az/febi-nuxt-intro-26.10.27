import "server-only";
// 勤怠まわりの処理。API のルートハンドラと定期処理から呼ぶ。

import { buildAttendanceCsv } from "@/lib/attendance/csv";
import { summarizeDay, summarizeMonth } from "@/lib/attendance/calc";
import { allowedPunches, applyPunch, getPunchState } from "@/lib/attendance/punch";
import {
  parseRecordInput,
  validateRecordInput,
} from "@/lib/attendance/validate";
import {
  addDetection,
  addRun,
  deleteRecord,
  findUserById,
  getRecord,
  listDetections,
  listEmployees,
  listRecordsByDate,
  listRecordsByMonth,
  listRuns,
  saveRecord,
  toPublicUser,
  type UserRow,
} from "@/lib/server/db";
import { nowInTokyo } from "@/lib/time";
import type {
  AttendanceRecord,
  DetectionRun,
  EmployeeMonthlySummary,
  MissingPunchDetection,
  MonthlyAttendance,
  PunchType,
  TodayStatus,
} from "@/lib/types";

export type ServiceResult<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; error: string; details?: string[] };

export function getMonthlyAttendance(user: UserRow, month: string): MonthlyAttendance {
  const { date: today } = nowInTokyo();
  const records = listRecordsByMonth(user.id, month);
  const { days, totals } = summarizeMonth(records, month, today);
  return { user: toPublicUser(user), month, days, totals };
}

export function getTodayStatus(userId: string): TodayStatus {
  const { date } = nowInTokyo();
  const record = getRecord(userId, date);
  const state = getPunchState(record);
  return { date, state, record, allowed: allowedPunches(state) };
}

export function punch(userId: string, type: PunchType): ServiceResult<TodayStatus> {
  const { date, time } = nowInTokyo();
  const current = getRecord(userId, date);
  const result = applyPunch(current, type, { userId, date, time });
  if (!result.ok) return { ok: false, status: 409, error: result.error };
  saveRecord(result.record);
  return { ok: true, value: getTodayStatus(userId) };
}

export function updateRecord(
  userId: string,
  date: string,
  body: unknown,
): ServiceResult<AttendanceRecord | null> {
  const parsed = parseRecordInput(body);
  if (!parsed.ok) {
    return { ok: false, status: 400, error: "入力内容に誤りがあります。", details: parsed.errors };
  }
  const { date: today, time: nowTime } = nowInTokyo();
  const validated = validateRecordInput(parsed.value, { date, today, nowTime });
  if (!validated.ok) {
    return { ok: false, status: 400, error: "入力内容に誤りがあります。", details: validated.errors };
  }

  const { clockIn, clockOut, breaks } = validated.value;
  if (clockIn === null) {
    deleteRecord(userId, date);
    return { ok: true, value: null };
  }
  const record: AttendanceRecord = { userId, date, clockIn, clockOut, breaks };
  saveRecord(record);
  return { ok: true, value: record };
}

export function getMonthlySummaries(month: string): EmployeeMonthlySummary[] {
  const { date: today } = nowInTokyo();
  return listEmployees().map((user) => {
    const { totals } = summarizeMonth(listRecordsByMonth(user.id, month), month, today);
    return { user, totals };
  });
}

/** userId が "all" なら従業員全員分。 */
export function buildMonthlyCsv(month: string, userId: string): ServiceResult<string> {
  const users =
    userId === "all"
      ? listEmployees()
      : listEmployees().filter((u) => u.id === userId);
  if (users.length === 0) {
    return { ok: false, status: 404, error: "指定された従業員が見つかりません。" };
  }
  const { date: today } = nowInTokyo();
  const rows = users.flatMap((user) =>
    listRecordsByMonth(user.id, month).map((r) => ({ user, summary: summarizeDay(r, today) })),
  );
  return { ok: true, value: buildAttendanceCsv(rows) };
}

// ---- 打刻漏れの検出（受け入れ条件9） ----

/** 指定日の「出勤があるのに退勤がない」記録を探して記録する。 */
export function detectMissingPunches(
  targetDate: string,
  trigger: DetectionRun["trigger"],
  at: Date = new Date(),
): DetectionRun {
  const detectedAt = at.toISOString();
  const missing = listRecordsByDate(targetDate).filter(
    (r) =>
      r.clockIn !== null &&
      r.clockOut === null &&
      findUserById(r.userId)?.role === "employee",
  );
  for (const r of missing) {
    addDetection({ userId: r.userId, date: r.date, clockIn: r.clockIn, detectedAt });
  }
  const run: DetectionRun = {
    ranAt: detectedAt,
    targetDate,
    trigger,
    foundCount: missing.length,
  };
  addRun(run);
  return run;
}

export function getMissingPunchReport(): {
  detections: MissingPunchDetection[];
  runs: DetectionRun[];
} {
  const detections = listDetections()
    .map((d) => {
      const current = getRecord(d.userId, d.date);
      return {
        ...d,
        userName: findUserById(d.userId)?.name ?? d.userId,
        resolved: current === null || current.clockOut !== null,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.userId.localeCompare(b.userId));
  const runs = listRuns().sort((a, b) => b.ranAt.localeCompare(a.ranAt));
  return { detections, runs };
}
