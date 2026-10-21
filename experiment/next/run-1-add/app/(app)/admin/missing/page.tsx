"use client";

import { Anchor, Badge, Button, Group, Paper, Stack, Table, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Loading } from "@/components/Loading";
import { ErrorAlert, SuccessAlert } from "@/components/Alert";
import { PageTitle } from "@/components/PageTitle";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { addDays, formatDateShort, formatDateTimeJst, todayInJst } from "@/lib/time";
import type { MissingClockOutLog } from "@/lib/types";

type LogRow = MissingClockOutLog & { resolved: boolean };

// 今日の日付から初期表示の月（日）を決めるため、リクエスト時に描画する
export default function MissingClockOutsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MissingClockOutsPageContent />
    </Suspense>
  );
}

function MissingClockOutsPageContent() {
  const [logs, setLogs] = useState<LogRow[] | null>(null);
  const [date, setDate] = useState(() => addDays(todayInJst(), -1));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ logs: LogRow[] }>("/api/admin/missing-clock-outs")
      .then((res) => !cancelled && setLogs(res.logs))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function run() {
    setRunning(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch<{ date: string; added: MissingClockOutLog[] }>("/api/admin/missing-clock-outs", {
        method: "POST",
        body: JSON.stringify({ date }),
      });
      setMessage(`${formatDateShort(res.date)} の打刻漏れを検出しました。新しく記録したもの: ${res.added.length} 件`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <PageTitle>打刻漏れの検出記録</PageTitle>
      <Stack>
        <Text size="sm" c="dimmed">
          毎日 0:00（日本時間）に、前日の「出勤だけ打刻して退勤がない」勤怠を自動で検出し、ここに記録します。
        </Text>
        <ErrorAlert message={error} />
        <SuccessAlert message={message} />

        <Paper withBorder p="md">
          <Group align="flex-end" gap="sm">
            <DatePickerInput
              label="対象日を指定して今すぐ検出"
              value={date}
              onChange={(value) => value && setDate(value)}
              valueFormat="YYYY年M月D日"
              w={220}
            />
            <Button onClick={run} loading={running}>
              検出を実行
            </Button>
          </Group>
        </Paper>

        {logs && (
          <Paper withBorder>
            <Table.ScrollContainer minWidth={760}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>対象日</Table.Th>
                    <Table.Th>従業員</Table.Th>
                    <Table.Th>出勤</Table.Th>
                    <Table.Th>検出日時</Table.Th>
                    <Table.Th>検出方法</Table.Th>
                    <Table.Th>現在の状態</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {logs.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={7} c="dimmed">
                        検出された打刻漏れはありません。
                      </Table.Td>
                    </Table.Tr>
                  )}
                  {logs.map((log) => (
                    <Table.Tr key={log.id}>
                      <Table.Td>{formatDateShort(log.date)}</Table.Td>
                      <Table.Td>
                        {log.userId} {log.userName}
                      </Table.Td>
                      <Table.Td>{log.clockIn}</Table.Td>
                      <Table.Td>{formatDateTimeJst(log.detectedAt)}</Table.Td>
                      <Table.Td>{log.source === "schedule" ? "定期処理" : "手動"}</Table.Td>
                      <Table.Td>
                        {log.resolved ? (
                          <Badge color="green" variant="light">
                            修正済み
                          </Badge>
                        ) : (
                          <Badge color="red" variant="light">
                            未修正
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td ta="right">
                        <Anchor
                          component={Link}
                          href={`/admin/attendance?userId=${log.userId}&month=${log.date.slice(0, 7)}`}
                          inherit
                        >
                          勤怠を修正
                        </Anchor>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        )}
      </Stack>
    </div>
  );
}
