// 管理者による勤怠修正の入力チェック（純粋関数）。

import { parseTime } from "./time";
import type { BreakPeriod } from "./types";

export type AttendanceEditInput = {
  clockIn: string;
  clockOut: string;
  breaks: { start: string; end: string }[];
};

export type AttendanceEditResult =
  | { ok: true; action: "delete" }
  | { ok: true; action: "save"; clockIn: number; clockOut: number | null; breaks: BreakPeriod[] }
  | { ok: false; errors: string[] };

/** 入力の形（JSON）が正しいかを確かめる。 */
export function isAttendanceEditInput(value: unknown): value is AttendanceEditInput {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.clockIn === "string" &&
    typeof v.clockOut === "string" &&
    Array.isArray(v.breaks) &&
    v.breaks.every(
      (b) =>
        typeof b === "object" &&
        b !== null &&
        typeof (b as Record<string, unknown>).start === "string" &&
        typeof (b as Record<string, unknown>).end === "string",
    )
  );
}

/**
 * 修正内容をチェックして、保存する値に変換する。
 * - 出勤・退勤・休憩がすべて空なら、その日の勤怠を削除する。
 * - 退勤は空でもよい（打刻漏れのまま残す）。
 * - 退勤は出勤以降、休憩は出勤〜退勤の間で、互いに重ならないこと。
 */
export function validateAttendanceEdit(input: AttendanceEditInput): AttendanceEditResult {
  const clockInText = input.clockIn.trim();
  const clockOutText = input.clockOut.trim();
  const breakTexts = input.breaks
    .map((b) => ({ start: b.start.trim(), end: b.end.trim() }))
    .filter((b) => b.start !== "" || b.end !== "");

  if (clockInText === "" && clockOutText === "" && breakTexts.length === 0) {
    return { ok: true, action: "delete" };
  }

  const errors: string[] = [];
  if (clockInText === "") errors.push("出勤の時刻を入力してください。");

  const clockIn = clockInText === "" ? null : parseTime(clockInText);
  if (clockInText !== "" && clockIn === null) errors.push("出勤の時刻は HH:MM の形式で入力してください。");

  const clockOut = clockOutText === "" ? null : parseTime(clockOutText);
  if (clockOutText !== "" && clockOut === null) errors.push("退勤の時刻は HH:MM の形式で入力してください。");

  if (clockIn !== null && clockOut !== null && clockOut < clockIn) {
    errors.push("退勤は出勤より後の時刻にしてください。");
  }

  const breaks: BreakPeriod[] = [];
  breakTexts.forEach((b, i) => {
    const label = `休憩${i + 1}`;
    if (b.start === "" || b.end === "") {
      errors.push(`${label}の開始と終了を両方入力してください。`);
      return;
    }
    const start = parseTime(b.start);
    const end = parseTime(b.end);
    if (start === null || end === null) {
      errors.push(`${label}の時刻は HH:MM の形式で入力してください。`);
      return;
    }
    if (end < start) {
      errors.push(`${label}の終了は開始より後の時刻にしてください。`);
      return;
    }
    if ((clockIn !== null && start < clockIn) || (clockOut !== null && end > clockOut)) {
      errors.push(`${label}は出勤から退勤までの間にしてください。`);
      return;
    }
    breaks.push({ start, end });
  });

  const sorted = [...breaks].sort((a, b) => a.start - b.start);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start < sorted[i - 1].end!) {
      errors.push("休憩の時間帯が重なっています。");
      break;
    }
  }

  if (errors.length > 0 || clockIn === null) return { ok: false, errors };
  return { ok: true, action: "save", clockIn, clockOut, breaks: sorted };
}
