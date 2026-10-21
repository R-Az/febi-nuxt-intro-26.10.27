// 管理者による勤怠修正の入力チェック（受け入れ条件6）。

import { isValidTime, timeToMinutes } from "@/lib/time";
import type { BreakPeriod } from "@/lib/types";

export type RecordInput = {
  clockIn: string | null;
  clockOut: string | null;
  breaks: { start: string; end: string }[];
};

type Result<T> = { ok: true; value: T } | { ok: false; errors: string[] };

function optionalTime(value: unknown): string | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") return value;
  return undefined;
}

/** リクエストボディの形と時刻の書式をチェックする。空文字は未入力（null）として扱う。 */
export function parseRecordInput(body: unknown): Result<RecordInput> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, errors: ["リクエストの形式が正しくありません。"] };
  }
  const raw = body as Record<string, unknown>;
  const errors: string[] = [];

  const clockIn = optionalTime(raw.clockIn);
  const clockOut = optionalTime(raw.clockOut);
  if (clockIn === undefined) errors.push("出勤時刻の形式が正しくありません。");
  if (clockOut === undefined) errors.push("退勤時刻の形式が正しくありません。");
  if (clockIn && !isValidTime(clockIn)) errors.push("出勤時刻は HH:MM の形式で入力してください。");
  if (clockOut && !isValidTime(clockOut)) errors.push("退勤時刻は HH:MM の形式で入力してください。");

  const breaks: { start: string; end: string }[] = [];
  const rawBreaks = raw.breaks ?? [];
  if (!Array.isArray(rawBreaks)) {
    errors.push("休憩の形式が正しくありません。");
  } else {
    rawBreaks.forEach((b, i) => {
      const label = `休憩${i + 1}`;
      if (typeof b !== "object" || b === null) {
        errors.push(`${label}の形式が正しくありません。`);
        return;
      }
      const start = optionalTime((b as Record<string, unknown>).start);
      const end = optionalTime((b as Record<string, unknown>).end);
      if (!start || !end) {
        errors.push(`${label}の開始と終了を両方入力してください。`);
        return;
      }
      if (!isValidTime(start) || !isValidTime(end)) {
        errors.push(`${label}の時刻は HH:MM の形式で入力してください。`);
        return;
      }
      breaks.push({ start, end });
    });
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { clockIn: clockIn ?? null, clockOut: clockOut ?? null, breaks } };
}

/**
 * 勤怠の内容として成り立つかをチェックする。
 * @param context.date 修正する日付
 * @param context.today 日本時間の今日
 * @param context.nowTime 日本時間の現在時刻 "HH:MM"
 */
export function validateRecordInput(
  input: RecordInput,
  context: { date: string; today: string; nowTime: string },
): Result<{ clockIn: string | null; clockOut: string | null; breaks: BreakPeriod[] }> {
  const errors: string[] = [];
  const { clockIn, clockOut } = input;
  const breaks = [...input.breaks].sort(
    (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
  );

  if (context.date > context.today) {
    return { ok: false, errors: ["未来の日付は修正できません。"] };
  }

  // すべて空なら「記録なし」にする（削除）。
  if (clockIn === null && clockOut === null && breaks.length === 0) {
    return { ok: true, value: { clockIn: null, clockOut: null, breaks: [] } };
  }

  if (clockIn === null) {
    errors.push("退勤や休憩を入力する場合は、出勤時刻も入力してください。");
    return { ok: false, errors };
  }

  const inMin = timeToMinutes(clockIn);
  const outMin = clockOut === null ? null : timeToMinutes(clockOut);

  if (outMin !== null && outMin <= inMin) {
    errors.push("退勤時刻は出勤時刻より後にしてください。");
  }

  breaks.forEach((b, i) => {
    const label = `休憩（${b.start}〜${b.end}）`;
    const s = timeToMinutes(b.start);
    const e = timeToMinutes(b.end);
    if (e <= s) errors.push(`${label}の終了は開始より後にしてください。`);
    if (s < inMin) errors.push(`${label}は出勤時刻より後にしてください。`);
    if (outMin !== null && e > outMin) errors.push(`${label}は退勤時刻より前にしてください。`);
    const prev = breaks[i - 1];
    if (prev && s < timeToMinutes(prev.end)) {
      errors.push(`${label}が他の休憩と重なっています。`);
    }
  });

  if (context.date === context.today) {
    const now = timeToMinutes(context.nowTime);
    const times = [clockIn, clockOut, ...breaks.flatMap((b) => [b.start, b.end])];
    if (times.some((t) => t !== null && timeToMinutes(t) > now)) {
      errors.push("今日の記録に、現在時刻より後の時刻は入力できません。");
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { clockIn, clockOut, breaks } };
}
