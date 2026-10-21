"use client";

import { useEffect, useState } from "react";
import { useSession, withSession } from "@/components/app-shell";
import { AttendanceTable, TotalsSummary } from "@/components/attendance-table";
import { MonthPicker } from "@/components/month-picker";
import { apiFetch, errorMessage } from "@/lib/client/api";
import type { MonthlyAttendance } from "@/lib/types";

function MyAttendancePage() {
  const { user, today } = useSession();
  const currentMonth = today.slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [result, setResult] = useState<{
    month: string;
    data?: MonthlyAttendance;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let ignore = false;
    apiFetch<MonthlyAttendance>(`/api/users/${user.id}/attendance?month=${month}`)
      .then((data) => !ignore && setResult({ month, data }))
      .catch((e) => !ignore && setResult({ month, error: errorMessage(e) }));
    return () => {
      ignore = true;
    };
  }, [user.id, month]);

  const loading = result?.month !== month;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">自分の勤怠一覧</h1>
        <MonthPicker value={month} max={currentMonth} onChange={setMonth} />
      </div>
      {loading && <p className="text-gray-500">読み込み中…</p>}
      {!loading && result?.error && <p className="text-red-600">{result.error}</p>}
      {!loading && result?.data && (
        <>
          <TotalsSummary totals={result.data.totals} />
          <AttendanceTable data={result.data} />
        </>
      )}
    </div>
  );
}

export default withSession(MyAttendancePage);
