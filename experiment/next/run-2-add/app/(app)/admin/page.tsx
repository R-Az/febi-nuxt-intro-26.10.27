"use client";

import { Anchor, Card, Stack, Table, Text } from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, withSession } from "@/components/app-shell";
import { MonthPicker } from "@/components/month-picker";
import { Loading, Notice, PageHeader } from "@/components/ui";
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
    <Stack gap="lg">
      <PageHeader title="月次一覧">
        <MonthPicker value={month} max={currentMonth} onChange={setMonth} />
      </PageHeader>
      {loading && <Loading />}
      {!loading && result?.error && <Notice kind="error">{result.error}</Notice>}
      {!loading && result?.data && (
        <Card withBorder padding={0}>
          <Table.ScrollContainer minWidth={640}>
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
                {result.data.summaries.map(({ user, totals }) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>{user.id}</Table.Td>
                    <Table.Td>{user.name}</Table.Td>
                    <Table.Td ta="right">{totals.workDays}日</Table.Td>
                    <Table.Td ta="right">{formatDuration(totals.workMinutes)}</Table.Td>
                    <Table.Td ta="right">{formatDuration(totals.overtimeMinutes)}</Table.Td>
                    <Table.Td
                      ta="right"
                      c={totals.missingCount > 0 ? "red" : undefined}
                      fw={totals.missingCount > 0 ? 700 : undefined}
                    >
                      {totals.missingCount}件
                    </Table.Td>
                    <Table.Td ta="right">
                      <Anchor
                        component={Link}
                        href={`/admin/attendance?userId=${user.id}&month=${month}`}
                        size="sm"
                      >
                        日別・修正
                      </Anchor>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      )}
      <Text size="xs" c="dimmed">
        実働・残業の合計に打刻漏れの日は含みません。時間は「時間:分」で表示しています。
      </Text>
    </Stack>
  );
}

export default withSession(AdminMonthlyPage);
