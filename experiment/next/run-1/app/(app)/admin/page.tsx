"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Loading } from "@/components/Loading";
import { ErrorAlert } from "@/components/Alert";
import { MonthPicker } from "@/components/MonthPicker";
import { PageTitle } from "@/components/PageTitle";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { currentMonthInJst, formatDuration, formatMonth } from "@/lib/time";
import type { MonthTotals, PublicUser } from "@/lib/types";

type SummaryResponse = { month: string; summaries: { user: PublicUser; totals: MonthTotals }[] };

const th = "border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-500";
const td = "border-b border-slate-100 px-4 py-3";

// 今日の日付から初期表示の月（日）を決めるため、リクエスト時に描画する
export default function AdminSummaryPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminSummaryPageContent />
    </Suspense>
  );
}

function AdminSummaryPageContent() {
  const [month, setMonth] = useState(() => currentMonthInJst());
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<SummaryResponse>(`/api/admin/summary?month=${month}`)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [month]);

  return (
    <div>
      <PageTitle actions={<MonthPicker value={month} onChange={setMonth} />}>
        月次一覧（{formatMonth(month)}）
      </PageTitle>
      <div className="space-y-4">
        <ErrorAlert message={error} />
        {data && data.month === month && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="tabular w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>従業員ID</th>
                  <th className={th}>氏名</th>
                  <th className={`${th} text-right`}>出勤日数</th>
                  <th className={`${th} text-right`}>実働時間の合計</th>
                  <th className={`${th} text-right`}>残業時間の合計</th>
                  <th className={`${th} text-right`}>打刻漏れ</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {data.summaries.map(({ user, totals }) => (
                  <tr key={user.id}>
                    <td className={td}>{user.id}</td>
                    <td className={td}>{user.name}</td>
                    <td className={`${td} text-right`}>{totals.workDays} 日</td>
                    <td className={`${td} text-right`}>{formatDuration(totals.workMinutes)}</td>
                    <td className={`${td} text-right`}>{formatDuration(totals.overtimeMinutes)}</td>
                    <td className={`${td} text-right`}>
                      {totals.missingCount > 0 ? (
                        <span className="font-semibold text-red-700">{totals.missingCount} 件</span>
                      ) : (
                        "0 件"
                      )}
                    </td>
                    <td className={`${td} text-right`}>
                      <Link
                        href={`/admin/attendance?userId=${user.id}&month=${month}`}
                        className="text-sm text-sky-700 hover:underline"
                      >
                        日別を見る・修正
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-slate-500">打刻漏れの日は実働・残業の合計に含めません。</p>
      </div>
    </div>
  );
}
