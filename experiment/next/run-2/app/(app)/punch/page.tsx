"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession, withSession } from "@/components/app-shell";
import { calcBreakMinutes } from "@/lib/attendance/calc";
import { PUNCH_LABELS, PUNCH_STATE_LABELS } from "@/lib/attendance/punch";
import { apiFetch, errorMessage } from "@/lib/client/api";
import { dayOfWeek, formatDuration, nowInTokyo, WEEKDAY_LABELS } from "@/lib/time";
import type { PunchType, TodayStatus } from "@/lib/types";

const BUTTONS: PunchType[] = ["clock_in", "break_start", "break_end", "clock_out"];

function useClock(): string | null {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTime(nowInTokyo().time);
    const id = setInterval(tick, 1000);
    const first = setTimeout(tick, 0);
    return () => {
      clearInterval(id);
      clearTimeout(first);
    };
  }, []);
  return time;
}

function PunchPage() {
  const { user } = useSession();
  const clock = useClock();
  const [status, setStatus] = useState<TodayStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(
    () =>
      apiFetch<TodayStatus>(`/api/users/${user.id}/today`)
        .then(setStatus)
        .catch((e) => setError(errorMessage(e))),
    [user.id],
  );

  useEffect(() => {
    load();
  }, [load]);

  async function handlePunch(type: PunchType) {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const next = await apiFetch<TodayStatus>(`/api/users/${user.id}/punches`, {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      setStatus(next);
      setMessage(`「${PUNCH_LABELS[type]}」を打刻しました。`);
    } catch (e) {
      setError(errorMessage(e));
      await load();
    } finally {
      setPending(false);
    }
  }

  const record = status?.record;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">打刻</h1>

      <section className="card flex flex-col items-center gap-2 py-8">
        {status && (
          <p className="text-gray-600">
            {status.date.replaceAll("-", "/")}（{WEEKDAY_LABELS[dayOfWeek(status.date)]}）
          </p>
        )}
        <p className="text-5xl font-bold tabular-nums">{clock ?? "--:--"}</p>
        {status && (
          <p className="mt-2 rounded-full bg-gray-100 px-4 py-1 text-sm">
            現在の状態：<span className="font-medium">{PUNCH_STATE_LABELS[status.state]}</span>
          </p>
        )}
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {BUTTONS.map((type) => (
          <button
            key={type}
            type="button"
            className={`btn py-6 text-lg ${type === "clock_in" || type === "clock_out" ? "btn-primary" : "btn-secondary"}`}
            disabled={!status || pending || !status.allowed.includes(type)}
            onClick={() => handlePunch(type)}
          >
            {PUNCH_LABELS[type]}
          </button>
        ))}
      </section>

      {message && <p className="text-green-700">{message}</p>}
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      <section className="card">
        <h2 className="mb-3 font-bold">今日の記録</h2>
        {!record ? (
          <p className="text-gray-500">まだ打刻していません。</p>
        ) : (
          <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
            <dt className="text-gray-500">出勤</dt>
            <dd>{record.clockIn ?? "—"}</dd>
            <dt className="text-gray-500">休憩</dt>
            <dd>
              {record.breaks.length === 0
                ? "—"
                : record.breaks.map((b, i) => (
                    <span key={i} className="mr-4">
                      {b.start}〜{b.end ?? "（休憩中）"}
                    </span>
                  ))}
              {record.breaks.length > 0 && (
                <span className="text-gray-500">
                  （合計 {formatDuration(calcBreakMinutes(record.breaks))}）
                </span>
              )}
            </dd>
            <dt className="text-gray-500">退勤</dt>
            <dd>{record.clockOut ?? "—"}</dd>
          </dl>
        )}
      </section>
    </div>
  );
}

export default withSession(PunchPage);
