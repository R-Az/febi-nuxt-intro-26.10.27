"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ErrorAlert, SuccessAlert } from "@/components/Alert";
import { PageTitle } from "@/components/PageTitle";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { PUNCH_LABEL, PUNCH_STATE_LABEL } from "@/lib/punch";
import { formatDateShort, formatDuration } from "@/lib/time";
import type { AttendanceRow, PunchAction, PunchState } from "@/lib/types";

type TodayResponse = {
  date: string;
  now: string;
  state: PunchState;
  allowedActions: PunchAction[];
  record: AttendanceRow | null;
};

const ACTIONS: { action: PunchAction; className: string }[] = [
  { action: "clock_in", className: "bg-emerald-600 hover:bg-emerald-500" },
  { action: "break_start", className: "bg-amber-500 hover:bg-amber-400" },
  { action: "break_end", className: "bg-sky-600 hover:bg-sky-500" },
  { action: "clock_out", className: "bg-slate-700 hover:bg-slate-600" },
];

const clockFormat = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function subscribeClock(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

/** 日本時間の現在時刻（表示用）。サーバー側の描画では空文字。 */
function useClock(): string {
  return useSyncExternalStore(
    subscribeClock,
    () => clockFormat.format(new Date()),
    () => "",
  );
}

function fetchToday() {
  return apiFetch<TodayResponse>("/api/attendance/today");
}

export default function PunchPage() {
  const clock = useClock();
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchToday()
      .then((res) => !cancelled && setToday(res))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  async function punch(action: PunchAction) {
    setSending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch<TodayResponse>("/api/attendance/punch", {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      setToday(res);
      setMessage(`${res.now} に「${PUNCH_LABEL[action]}」を打刻しました。`);
    } catch (err) {
      setError(errorMessage(err));
      // 別の画面で打刻した場合などに備えて、最新の状態を取り直す
      setToday(await fetchToday().catch(() => today));
    } finally {
      setSending(false);
    }
  }

  const record = today?.record;

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle>打刻</PageTitle>
      <div className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">{today ? formatDateShort(today.date) : " "}</p>
          <p className="tabular my-2 text-5xl font-bold text-slate-800">{clock || " "}</p>
          <p className="mb-8">
            現在の状態：
            <span className="font-semibold">{today ? PUNCH_STATE_LABEL[today.state] : "読み込み中…"}</span>
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {ACTIONS.map(({ action, className }) => {
              const enabled = !!today && today.allowedActions.includes(action) && !sending;
              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => punch(action)}
                  disabled={!enabled}
                  className={`rounded-lg py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 ${className}`}
                >
                  {PUNCH_LABEL[action]}
                </button>
              );
            })}
          </div>
          {/* メッセージでボタンの位置がずれないよう、ボタンの下に出す */}
          <div className="mt-6 min-h-12 text-left">
            <ErrorAlert message={error} />
            <SuccessAlert message={message} />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-3 font-semibold text-slate-700">今日の記録</h2>
          {record ? (
            <dl className="tabular grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
              <dt className="text-slate-500">出勤</dt>
              <dd>{record.clockIn}</dd>
              <dt className="text-slate-500">休憩</dt>
              <dd>
                {record.breaks.length === 0
                  ? "—"
                  : record.breaks.map((b) => `${b.start}〜${b.end ?? "（休憩中）"}`).join(", ")}
                {record.breakMinutes > 0 && `（合計 ${formatDuration(record.breakMinutes)}）`}
              </dd>
              <dt className="text-slate-500">退勤</dt>
              <dd>{record.clockOut ?? "—"}</dd>
              <dt className="text-slate-500">実働時間</dt>
              <dd>{record.workMinutes != null ? formatDuration(record.workMinutes) : "—"}</dd>
              <dt className="text-slate-500">残業時間</dt>
              <dd>{record.overtimeMinutes != null ? formatDuration(record.overtimeMinutes) : "—"}</dd>
            </dl>
          ) : (
            <p className="text-sm text-slate-500">まだ打刻していません。</p>
          )}
        </section>
      </div>
    </div>
  );
}
