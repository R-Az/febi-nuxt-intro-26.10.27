"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, withSession } from "@/components/app-shell";
import { MonthPicker } from "@/components/month-picker";
import { apiFetch, errorMessage } from "@/lib/client/api";
import { formatDuration } from "@/lib/time";
import type { EmployeeMonthlySummary } from "@/lib/types";

type Response = { month: string; summaries: EmployeeMonthlySummary[] };

function AdminMonthlyPage() {
  const { today } = useSession();
  const currentMonth = today.slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [result, setResult] = useState<{ month: string; data?: Response; error?: string } | null>(
    null,
  );

  useEffect(() => {
    let ignore = false;
    apiFetch<Response>(`/api/admin/monthly-summary?month=${month}`)
      .then((data) => !ignore && setResult({ month, data }))
      .catch((e) => !ignore && setResult({ month, error: errorMessage(e) }));
    return () => {
      ignore = true;
    };
  }, [month]);

  const loading = result?.month !== month;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">月次一覧</h1>
        <MonthPicker value={month} max={currentMonth} onChange={setMonth} />
      </div>
      {loading && <p className="text-gray-500">読み込み中…</p>}
      {!loading && result?.error && <p className="text-red-600">{result.error}</p>}
      {!loading && result?.data && (
        <div className="card overflow-x-auto p-0">
          <table className="table">
            <thead>
              <tr>
                <th>従業員ID</th>
                <th>氏名</th>
                <th className="num">出勤日数</th>
                <th className="num">実働時間の合計</th>
                <th className="num">残業時間の合計</th>
                <th className="num">打刻漏れ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {result.data.summaries.map(({ user, totals }) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td className="num">{totals.workDays}日</td>
                  <td className="num">{formatDuration(totals.workMinutes)}</td>
                  <td className="num">{formatDuration(totals.overtimeMinutes)}</td>
                  <td className={`num ${totals.missingCount > 0 ? "font-bold text-red-600" : ""}`}>
                    {totals.missingCount}件
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/admin/attendance?userId=${user.id}&month=${month}`}
                      className="text-blue-600 hover:underline"
                    >
                      日別・修正
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-500">
        実働・残業の合計に打刻漏れの日は含みません。時間は「時間:分」で表示しています。
      </p>
    </div>
  );
}

export default withSession(AdminMonthlyPage);
