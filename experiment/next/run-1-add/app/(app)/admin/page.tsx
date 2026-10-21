"use client";

import { Anchor, Paper, Stack, Table, Text } from "@mantine/core";
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
      <Stack>
        <ErrorAlert message={error} />
        {data && data.month === month && (
          <Paper withBorder>
            <Table.ScrollContainer minWidth={720}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>従業員ID</Table.Th>
                    <Table.Th>氏名</Table.Th>
                    <Table.Th ta="right">出勤日数</Table.Th>
                    <Table.Th ta="right">実働時間の合計</Table.Th>
                    <Table.Th ta="right">残業時間の合計</Table.Th>
                    <Table.Th ta="right">打刻漏れ</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.summaries.map(({ user, totals }) => (
                    <Table.Tr key={user.id}>
                      <Table.Td>{user.id}</Table.Td>
                      <Table.Td>{user.name}</Table.Td>
                      <Table.Td ta="right">{totals.workDays} 日</Table.Td>
                      <Table.Td ta="right">{formatDuration(totals.workMinutes)}</Table.Td>
                      <Table.Td ta="right">{formatDuration(totals.overtimeMinutes)}</Table.Td>
                      <Table.Td ta="right">
                        {totals.missingCount > 0 ? (
                          <Text span inherit fw={700} c="red">
                            {totals.missingCount} 件
                          </Text>
                        ) : (
                          "0 件"
                        )}
                      </Table.Td>
                      <Table.Td ta="right">
                        <Anchor component={Link} href={`/admin/attendance?userId=${user.id}&month=${month}`} inherit>
                          日別を見る・修正
                        </Anchor>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        )}
        <Text size="xs" c="dimmed">
          打刻漏れの日は実働・残業の合計に含めません。
        </Text>
      </Stack>
    </div>
  );
}
