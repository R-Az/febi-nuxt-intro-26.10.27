"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Loading } from "@/components/Loading";
import { ErrorAlert, SuccessAlert } from "@/components/Alert";
import { PageTitle } from "@/components/PageTitle";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { addDays, formatDateShort, formatDateTimeJst, todayInJst } from "@/lib/time";
import type { MissingClockOutLog } from "@/lib/types";

type LogRow = MissingClockOutLog & { resolved: boolean };

const th = "border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-500";
const td = "border-b border-slate-100 px-4 py-3";

// 今日の日付から初期表示の月（日）を決めるため、リクエスト時に描画する
export default function MissingClockOutsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MissingClockOutsPageContent />
    </Suspense>
  );
}

function MissingClockOutsPageContent() {
  const [logs, setLogs] = useState<LogRow[] | null>(null);
  const [date, setDate] = useState(() => addDays(todayInJst(), -1));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ logs: LogRow[] }>("/api/admin/missing-clock-outs")
      .then((res) => !cancelled && setLogs(res.logs))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function run() {
    setRunning(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch<{ date: string; added: MissingClockOutLog[] }>("/api/admin/missing-clock-outs", {
        method: "POST",
        body: JSON.stringify({ date }),
      });
      setMessage(`${formatDateShort(res.date)} の打刻漏れを検出しました。新しく記録したもの: ${res.added.length} 件`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <PageTitle>打刻漏れの検出記録</PageTitle>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          毎日 0:00（日本時間）に、前日の「出勤だけ打刻して退勤がない」勤怠を自動で検出し、ここに記録します。
        </p>
        <ErrorAlert message={error} />
        <SuccessAlert message={message} />

        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <label>
            <span className="mb-1 block text-slate-600">対象日を指定して今すぐ検出</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="rounded bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            検出を実行
          </button>
        </div>

        {logs && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="tabular w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>対象日</th>
                  <th className={th}>従業員</th>
                  <th className={th}>出勤</th>
                  <th className={th}>検出日時</th>
                  <th className={th}>検出方法</th>
                  <th className={th}>現在の状態</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr>
                    <td className={`${td} text-slate-500`} colSpan={7}>
                      検出された打刻漏れはありません。
                    </td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className={td}>{formatDateShort(log.date)}</td>
                    <td className={td}>
                      {log.userId} {log.userName}
                    </td>
                    <td className={td}>{log.clockIn}</td>
                    <td className={td}>{formatDateTimeJst(log.detectedAt)}</td>
                    <td className={td}>{log.source === "schedule" ? "定期処理" : "手動"}</td>
                    <td className={td}>
                      {log.resolved ? (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">修正済み</span>
                      ) : (
                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          未修正
                        </span>
                      )}
                    </td>
                    <td className={`${td} text-right`}>
                      <Link
                        href={`/admin/attendance?userId=${log.userId}&month=${log.date.slice(0, 7)}`}
                        className="text-sky-700 hover:underline"
                      >
                        勤怠を修正
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
