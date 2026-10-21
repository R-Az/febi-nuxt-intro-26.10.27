"use client";

import { Anchor, Group, NativeSelect, Stack } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSession, withSession } from "@/components/app-shell";
import { AttendanceTable, TotalsSummary } from "@/components/attendance-table";
import { MonthPicker } from "@/components/month-picker";
import { RecordEditor } from "@/components/record-editor";
import { Loading, Notice, PageHeader } from "@/components/ui";
import { apiFetch, errorMessage } from "@/lib/client/api";
import { isValidMonth } from "@/lib/time";
import type { DaySummary, MonthlyAttendance, PublicUser } from "@/lib/types";

function AdminAttendancePage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminAttendance />
    </Suspense>
  );
}

function AdminAttendance() {
  const { today } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMonth = today.slice(0, 7);

  const [employees, setEmployees] = useState<PublicUser[] | null>(null);
  const [data, setData] = useState<MonthlyAttendance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ date: string; summary: DaySummary | null } | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  // 選択中の従業員と月は URL に持たせる（月次一覧からのリンクで開けるように）。
  const queryMonth = searchParams.get("month") ?? "";
  const month = isValidMonth(queryMonth) && queryMonth <= currentMonth ? queryMonth : currentMonth;
  const userId = searchParams.get("userId") ?? employees?.[0]?.id ?? null;

  function select(next: { userId?: string; month?: string }) {
    const params = new URLSearchParams({
      userId: next.userId ?? userId ?? "",
      month: next.month ?? month,
    });
    setMessage(null);
    router.replace(`/admin/attendance?${params}`);
  }

  useEffect(() => {
    apiFetch<{ employees: PublicUser[] }>("/api/admin/employees")
      .then((res) => setEmployees(res.employees))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const load = useCallback(
    (ignored: () => boolean = () => false) => {
      if (!userId) return Promise.resolve();
      return apiFetch<MonthlyAttendance>(`/api/users/${userId}/attendance?month=${month}`)
        .then((res) => {
          if (ignored()) return;
          setData(res);
          setError(null);
        })
        .catch((e) => !ignored() && setError(errorMessage(e)));
    },
    [userId, month],
  );

  useEffect(() => {
    let ignore = false;
    load(() => ignore);
    return () => {
      ignore = true;
    };
  }, [load]);

  const shown = data && data.user.id === userId && data.month === month ? data : null;

  return (
    <Stack gap="lg">
      <PageHeader title="勤怠修正">
        <Group gap="sm" wrap="wrap">
          <NativeSelect
            aria-label="従業員"
            value={userId ?? ""}
            onChange={(e) => select({ userId: e.currentTarget.value })}
            data={employees?.map((u) => ({ value: u.id, label: `${u.id} ${u.name}` })) ?? []}
          />
          <MonthPicker value={month} max={currentMonth} onChange={(m) => select({ month: m })} />
        </Group>
      </PageHeader>

      {message && <Notice kind="success">{message}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}
      {!shown && !error && <Loading />}
      {shown && (
        <>
          <TotalsSummary totals={shown.totals} />
          <AttendanceTable
            data={shown}
            renderAction={(date, summary) =>
              date <= today && (
                <Anchor
                  component="button"
                  type="button"
                  size="sm"
                  onClick={() => {
                    setMessage(null);
                    setEditing({ date, summary });
                  }}
                >
                  {summary ? "修正" : "入力"}
                </Anchor>
              )
            }
          />
        </>
      )}

      {editing && shown && (
        <RecordEditor
          user={shown.user}
          date={editing.date}
          summary={editing.summary}
          onClose={() => setEditing(null)}
          onSaved={async (text) => {
            setEditing(null);
            setMessage(text);
            await load();
          }}
        />
      )}
    </Stack>
  );
}

export default withSession(AdminAttendancePage);
