"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, withSession } from "@/components/app-shell";
import { apiFetch, errorMessage } from "@/lib/client/api";
import { addDays } from "@/lib/time";
import type { DetectionRun, MissingPunchDetection } from "@/lib/types";

type Report = { detections: MissingPunchDetection[]; runs: DetectionRun[] };

const TRIGGER_LABELS: Record<DetectionRun["trigger"], string> = {
  schedule: "定期実行（0時）",
  startup: "起動時の補完",
  manual: "手動",
  external: "外部から起動",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MissingPunchesPage() {
  const { today } = useSession();
  const yesterday = addDays(today, -1);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState(yesterday);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    apiFetch<Report>("/api/admin/missing-punches")
      .then(setReport)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  async function runNow() {
    setRunning(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch<Report & { run: DetectionRun }>("/api/admin/missing-punches", {
        method: "POST",
        body: JSON.stringify({ date: targetDate }),
      });
      setReport(res);
      setMessage(`${res.run.targetDate} の打刻漏れを検出しました（${res.run.foundCount}件）。`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">打刻漏れ検出</h1>
      <p className="text-sm text-gray-600">
        毎日0時（日本時間）に、前日の「出勤だけ打刻して退勤がない」記録を自動で検出して記録します。
        修正すると「修正済み」になります。
      </p>

      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      {message && <p className="text-green-700">{message}</p>}

      <section className="card space-y-3">
        <h2 className="font-bold">検出結果</h2>
        {!report && !error && <p className="text-gray-500">読み込み中…</p>}
        {report && report.detections.length === 0 && (
          <p className="text-gray-500">検出された打刻漏れはありません。</p>
        )}
        {report && report.detections.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>日付</th>
                  <th>従業員</th>
                  <th>出勤</th>
                  <th>検出日時</th>
                  <th>状態</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {report.detections.map((d) => (
                  <tr key={`${d.userId}:${d.date}`}>
                    <td>{d.date}</td>
                    <td>
                      {d.userId} {d.userName}
                    </td>
                    <td>{d.clockIn}</td>
                    <td>{formatDateTime(d.detectedAt)}</td>
                    <td>
                      {d.resolved ? (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          修正済み
                        </span>
                      ) : (
                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                          未修正
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/admin/attendance?userId=${d.userId}&month=${d.date.slice(0, 7)}`}
                        className="text-blue-600 hover:underline"
                      >
                        修正する
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-bold">手動で実行</h2>
        <p className="text-sm text-gray-600">
          サーバーが0時に止まっていた場合などに、指定した日の検出を手動で実行できます。
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            className="input"
            aria-label="検出する日付"
            value={targetDate}
            max={yesterday}
            onChange={(e) => setTargetDate(e.target.value)}
          />
          <button type="button" className="btn btn-secondary" onClick={runNow} disabled={running}>
            {running ? "実行中…" : "検出を実行"}
          </button>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-bold">実行履歴</h2>
        {report && report.runs.length === 0 && (
          <p className="text-gray-500">まだ実行されていません。</p>
        )}
        {report && report.runs.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>実行日時</th>
                <th>対象日</th>
                <th>きっかけ</th>
                <th className="num">検出件数</th>
              </tr>
            </thead>
            <tbody>
              {report.runs.map((r, i) => (
                <tr key={i}>
                  <td>{formatDateTime(r.ranAt)}</td>
                  <td>{r.targetDate}</td>
                  <td>{TRIGGER_LABELS[r.trigger]}</td>
                  <td className="num">{r.foundCount}件</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default withSession(MissingPunchesPage);
