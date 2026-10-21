"use client";

import { Anchor, Badge, Button, Card, Group, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, withSession } from "@/components/app-shell";
import { Loading, Notice, PageHeader } from "@/components/ui";
import { apiFetch, errorMessage } from "@/lib/client/api";
import { addDays } from "@/lib/time";
import type { DetectionRun, MissingPunchDetection } from "@/lib/types";

type Report = { detections: MissingPunchDetection[]; runs: DetectionRun[] };

const TRIGGER_LABELS: Record<DetectionRun["trigger"], string> = {
  schedule: "定期実行（0時）",
  startup: "起動時の補完",
  manual: "手動",
  external: "外部から起動",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MissingPunchesPage() {
  const { today } = useSession();
  const yesterday = addDays(today, -1);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState(yesterday);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    apiFetch<Report>("/api/admin/missing-punches")
      .then(setReport)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  async function runNow() {
    setRunning(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch<Report & { run: DetectionRun }>("/api/admin/missing-punches", {
        method: "POST",
        body: JSON.stringify({ date: targetDate }),
      });
      setReport(res);
      setMessage(`${res.run.targetDate} の打刻漏れを検出しました（${res.run.foundCount}件）。`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setRunning(false);
    }
  }

  return (
    <Stack gap="lg">
      <PageHeader title="打刻漏れ検出" />
      <Text size="sm" c="dimmed">
        毎日0時（日本時間）に、前日の「出勤だけ打刻して退勤がない」記録を自動で検出して記録します。
        修正すると「修正済み」になります。
      </Text>

      {error && <Notice kind="error">{error}</Notice>}
      {message && <Notice kind="success">{message}</Notice>}

      <Card withBorder>
        <Stack gap="sm">
          <Title order={2} size="h4">
            検出結果
          </Title>
          {!report && !error && <Loading />}
          {report && report.detections.length === 0 && (
            <Text c="dimmed">検出された打刻漏れはありません。</Text>
          )}
          {report && report.detections.length > 0 && (
            <Table.ScrollContainer minWidth={640}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>日付</Table.Th>
                    <Table.Th>従業員</Table.Th>
                    <Table.Th>出勤</Table.Th>
                    <Table.Th>検出日時</Table.Th>
                    <Table.Th>状態</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {report.detections.map((d) => (
                    <Table.Tr key={`${d.userId}:${d.date}`}>
                      <Table.Td>{d.date}</Table.Td>
                      <Table.Td>
                        {d.userId} {d.userName}
                      </Table.Td>
                      <Table.Td>{d.clockIn}</Table.Td>
                      <Table.Td>{formatDateTime(d.detectedAt)}</Table.Td>
                      <Table.Td>
                        {d.resolved ? (
                          <Badge variant="light" color="green">
                            修正済み
                          </Badge>
                        ) : (
                          <Badge variant="light" color="red">
                            未修正
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td ta="right">
                        <Anchor
                          component={Link}
                          href={`/admin/attendance?userId=${d.userId}&month=${d.date.slice(0, 7)}`}
                          size="sm"
                        >
                          修正する
                        </Anchor>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Stack>
      </Card>

      <Card withBorder>
        <Stack gap="sm">
          <Title order={2} size="h4">
            手動で実行
          </Title>
          <Text size="sm" c="dimmed">
            サーバーが0時に止まっていた場合などに、指定した日の検出を手動で実行できます。
          </Text>
          <Group gap="sm">
            <TextInput
              type="date"
              aria-label="検出する日付"
              value={targetDate}
              max={yesterday}
              onChange={(e) => setTargetDate(e.currentTarget.value)}
            />
            <Button variant="default" onClick={runNow} loading={running}>
              検出を実行
            </Button>
          </Group>
        </Stack>
      </Card>

      <Card withBorder>
        <Stack gap="sm">
          <Title order={2} size="h4">
            実行履歴
          </Title>
          {report && report.runs.length === 0 && (
            <Text c="dimmed">まだ実行されていません。</Text>
          )}
          {report && report.runs.length > 0 && (
            <Table.ScrollContainer minWidth={480}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>実行日時</Table.Th>
                    <Table.Th>対象日</Table.Th>
                    <Table.Th>きっかけ</Table.Th>
                    <Table.Th ta="right">検出件数</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {report.runs.map((r, i) => (
                    <Table.Tr key={i}>
                      <Table.Td>{formatDateTime(r.ranAt)}</Table.Td>
                      <Table.Td>{r.targetDate}</Table.Td>
                      <Table.Td>{TRIGGER_LABELS[r.trigger]}</Table.Td>
                      <Table.Td ta="right">{r.foundCount}件</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

export default withSession(MissingPunchesPage);
