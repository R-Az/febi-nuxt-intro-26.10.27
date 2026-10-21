// 打刻の状態遷移（純粋関数）。画面のボタン制御とサーバーのチェックの両方で使う。

import type { BreakPeriod, PunchAction, PunchState } from "./types";

type PunchTarget = { clockIn: number; clockOut: number | null; breaks: BreakPeriod[] };

export const PUNCH_LABEL: Record<PunchAction, string> = {
  clock_in: "出勤",
  break_start: "休憩開始",
  break_end: "休憩終了",
  clock_out: "退勤",
};

export const PUNCH_STATE_LABEL: Record<PunchState, string> = {
  not_started: "未出勤",
  working: "勤務中",
  on_break: "休憩中",
  finished: "退勤済み",
};

export function getPunchState(record: PunchTarget | null): PunchState {
  if (!record) return "not_started";
  if (record.clockOut !== null) return "finished";
  if (record.breaks.some((b) => b.end === null)) return "on_break";
  return "working";
}

const ALLOWED: Record<PunchState, PunchAction[]> = {
  not_started: ["clock_in"],
  working: ["break_start", "clock_out"],
  on_break: ["break_end"],
  finished: [],
};

export function allowedActions(state: PunchState): PunchAction[] {
  return ALLOWED[state];
}

const REJECT_MESSAGE: Record<PunchState, string> = {
  not_started: "まだ出勤していません。",
  working: "すでに出勤しています。",
  on_break: "休憩中です。先に休憩終了を打刻してください。",
  finished: "本日はすでに退勤しています。",
};

/**
 * 打刻を適用した新しい勤怠を返す。今の状態で押せない打刻ならエラーを返す。
 * @param minutes 打刻した時刻（その日の 0:00 からの経過分）
 */
export function applyPunch(
  record: PunchTarget | null,
  action: PunchAction,
  minutes: number,
): { ok: true; record: PunchTarget } | { ok: false; error: string } {
  const state = getPunchState(record);
  if (!allowedActions(state).includes(action)) {
    return { ok: false, error: `「${PUNCH_LABEL[action]}」は打刻できません。${REJECT_MESSAGE[state]}` };
  }
  switch (action) {
    case "clock_in":
      return { ok: true, record: { clockIn: minutes, clockOut: null, breaks: [] } };
    case "break_start":
      return { ok: true, record: { ...record!, breaks: [...record!.breaks, { start: minutes, end: null }] } };
    case "break_end":
      return {
        ok: true,
        record: { ...record!, breaks: record!.breaks.map((b) => (b.end === null ? { ...b, end: minutes } : b)) },
      };
    case "clock_out":
      return { ok: true, record: { ...record!, clockOut: minutes } };
  }
}
