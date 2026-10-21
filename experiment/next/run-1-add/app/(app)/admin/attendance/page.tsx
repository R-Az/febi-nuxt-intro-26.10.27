"use client";

import { Group, Select, Stack } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ErrorAlert, SuccessAlert } from "@/components/Alert";
import { Loading } from "@/components/Loading";
import { AttendanceEditor } from "@/components/AttendanceEditor";
import { AttendanceTable } from "@/components/AttendanceTable";
import { MonthPicker } from "@/components/MonthPicker";
import { PageTitle } from "@/components/PageTitle";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { currentMonthInJst, formatMonth, isValidMonth } from "@/lib/time";
import type { AttendanceRow, MonthTotals, PublicUser } from "@/lib/types";

type MonthlyResponse = { user: PublicUser; month: string; today: string; rows: AttendanceRow[]; totals: MonthTotals };

export default function AdminAttendancePage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminAttendance />
    </Suspense>
  );
}

function AdminAttendance() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qMonth = searchParams.get("month");
  const month = qMonth && isValidMonth(qMonth) ? qMonth : currentMonthInJst();
  const [employees, setEmployees] = useState<PublicUser[]>([]);
  // 従業員が未指定なら先頭の従業員を表示する
  const userId = searchParams.get("userId") || employees[0]?.id || "";

  const [data, setData] = useState<MonthlyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ date: string; row?: AttendanceRow } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const select = useCallback(
    (next: { userId?: string; month?: string }) => {
      const params = new URLSearchParams({ userId: next.userId ?? userId, month: next.month ?? month });
      setEditing(null);
      setMessage(null);
      router.replace(`/admin/attendance?${params}`);
    },
    [router, userId, month],
  );

  useEffect(() => {
    apiFetch<{ employees: PublicUser[] }>("/api/admin/employees")
      .then((res) => setEmployees(res.employees))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    apiFetch<MonthlyResponse>(`/api/attendance?userId=${encodeURIComponent(userId)}&month=${month}`)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError(null);
      })
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [userId, month, reloadKey]);

  const current = data && data.user.id === userId && data.month === month ? data : null;

  return (
    <div>
      <PageTitle
        actions={
          <Group gap="sm">
            <Select
              value={userId || null}
              onChange={(value) => value && select({ userId: value })}
              data={employees.map((e) => ({ value: e.id, label: `${e.id} ${e.name}` }))}
              allowDeselect={false}
              aria-label="従業員"
              w={180}
            />
            <MonthPicker value={month} onChange={(m) => select({ month: m })} />
          </Group>
        }
      >
        勤怠の修正（{current ? `${current.user.name}・` : ""}
        {formatMonth(month)}）
      </PageTitle>

      <Stack>
        <ErrorAlert message={error} />
        <SuccessAlert message={message} />
        {editing && current && (
          <AttendanceEditor
            key={editing.date}
            userId={current.user.id}
            userName={current.user.name}
            date={editing.date}
            row={editing.row}
            onCancel={() => setEditing(null)}
            onSaved={(text) => {
              setEditing(null);
              setMessage(text);
              setReloadKey((k) => k + 1);
            }}
          />
        )}
        {current && (
          <AttendanceTable
            month={month}
            rows={current.rows}
            totals={current.totals}
            editableUntil={current.today}
            onEdit={(date, row) => {
              setMessage(null);
              setEditing({ date, row });
            }}
          />
        )}
      </Stack>
    </div>
  );
}
