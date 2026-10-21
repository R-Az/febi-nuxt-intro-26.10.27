"use client";

import { Suspense, useEffect, useState } from "react";
import { Loading } from "@/components/Loading";
import { ErrorAlert } from "@/components/Alert";
import { AttendanceTable } from "@/components/AttendanceTable";
import { MonthPicker } from "@/components/MonthPicker";
import { PageTitle } from "@/components/PageTitle";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { currentMonthInJst, formatMonth } from "@/lib/time";
import type { AttendanceRow, MonthTotals } from "@/lib/types";

type MonthlyResponse = { month: string; rows: AttendanceRow[]; totals: MonthTotals };

// 今日の日付から初期表示の月（日）を決めるため、リクエスト時に描画する
export default function MyAttendancePage() {
  return (
    <Suspense fallback={<Loading />}>
      <MyAttendancePageContent />
    </Suspense>
  );
}

function MyAttendancePageContent() {
  const [month, setMonth] = useState(() => currentMonthInJst());
  const [data, setData] = useState<MonthlyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<MonthlyResponse>(`/api/attendance?month=${month}`)
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
        自分の勤怠一覧（{formatMonth(month)}）
      </PageTitle>
      <div className="space-y-4">
        <ErrorAlert message={error} />
        {data && data.month === month && <AttendanceTable month={month} rows={data.rows} totals={data.totals} />}
        <p className="text-xs text-slate-500">
          実働時間 = 退勤 − 出勤 − 休憩時間、残業時間 = 実働時間 − 8:00（マイナスなら 0）。
          打刻漏れの日は実働・残業を計算せず、合計にも含めません。
        </p>
      </div>
    </div>
  );
}
