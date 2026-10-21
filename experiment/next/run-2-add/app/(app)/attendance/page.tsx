"use client";

import { Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { useSession, withSession } from "@/components/app-shell";
import { AttendanceTable, TotalsSummary } from "@/components/attendance-table";
import { MonthPicker } from "@/components/month-picker";
import { Loading, Notice, PageHeader } from "@/components/ui";
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
    <Stack gap="lg">
      <PageHeader title="自分の勤怠一覧">
        <MonthPicker value={month} max={currentMonth} onChange={setMonth} />
      </PageHeader>
      {loading && <Loading />}
      {!loading && result?.error && <Notice kind="error">{result.error}</Notice>}
      {!loading && result?.data && (
        <>
          <TotalsSummary totals={result.data.totals} />
          <AttendanceTable data={result.data} />
        </>
      )}
    </Stack>
  );
}

export default withSession(MyAttendancePage);
