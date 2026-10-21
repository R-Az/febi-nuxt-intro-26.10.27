// 打刻の状態遷移（受け入れ条件2）。画面のボタン制御とサーバー側のチェックの両方で使う。

import type { AttendanceRecord, PunchState, PunchType } from "@/lib/types";

export const PUNCH_LABELS: Record<PunchType, string> = {
  clock_in: "出勤",
  break_start: "休憩開始",
  break_end: "休憩終了",
  clock_out: "退勤",
};

export const PUNCH_STATE_LABELS: Record<PunchState, string> = {
  not_started: "出勤前",
  working: "勤務中",
  on_break: "休憩中",
  finished: "退勤済み",
};

export function isPunchType(value: unknown): value is PunchType {
  return typeof value === "string" && value in PUNCH_LABELS;
}

export function getPunchState(record: AttendanceRecord | null): PunchState {
  if (!record || record.clockIn === null) return "not_started";
  if (record.clockOut !== null) return "finished";
  const last = record.breaks.at(-1);
  if (last && last.end === null) return "on_break";
  return "working";
}

const ALLOWED: Record<PunchState, PunchType[]> = {
  not_started: ["clock_in"],
  working: ["break_start", "clock_out"],
  on_break: ["break_end"],
  finished: [],
};

export function allowedPunches(state: PunchState): PunchType[] {
  return ALLOWED[state];
}

const REJECT_MESSAGES: Record<PunchState, string> = {
  not_started: "まだ出勤していません。",
  working: "すでに出勤しています。",
  on_break: "休憩中です。先に休憩終了を打刻してください。",
  finished: "本日はすでに退勤しています。",
};

export type PunchResult =
  | { ok: true; record: AttendanceRecord }
  | { ok: false; error: string };

/**
 * 打刻を適用した新しい記録を返す。今の状態で押せない打刻ならエラーを返す。
 * @param time 打刻時刻 "HH:MM"
 */
export function applyPunch(
  current: AttendanceRecord | null,
  type: PunchType,
  params: { userId: string; date: string; time: string },
): PunchResult {
  const state = getPunchState(current);
  if (!allowedPunches(state).includes(type)) {
    return {
      ok: false,
      error: `今の状態（${PUNCH_STATE_LABELS[state]}）では「${PUNCH_LABELS[type]}」を打刻できません。${REJECT_MESSAGES[state]}`,
    };
  }

  const { userId, date, time } = params;
  const base: AttendanceRecord = current
    ? { ...current, breaks: current.breaks.map((b) => ({ ...b })) }
    : { userId, date, clockIn: null, clockOut: null, breaks: [] };

  switch (type) {
    case "clock_in":
      base.clockIn = time;
      break;
    case "break_start":
      base.breaks.push({ start: time, end: null });
      break;
    case "break_end":
      base.breaks[base.breaks.length - 1].end = time;
      break;
    case "clock_out":
      base.clockOut = time;
      break;
  }
  return { ok: true, record: base };
}
