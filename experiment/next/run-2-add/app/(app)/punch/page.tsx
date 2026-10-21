"use client";

import { Badge, Button, Card, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { useSession, withSession } from "@/components/app-shell";
import { Notice, PageHeader } from "@/components/ui";
import { calcBreakMinutes } from "@/lib/attendance/calc";
import { PUNCH_LABELS, PUNCH_STATE_LABELS } from "@/lib/attendance/punch";
import { trackPunch } from "@/lib/client/analytics";
import { apiFetch, errorMessage } from "@/lib/client/api";
import { dayOfWeek, formatDuration, nowInTokyo, WEEKDAY_LABELS } from "@/lib/time";
import type { PunchType, TodayStatus } from "@/lib/types";

const BUTTONS: PunchType[] = ["clock_in", "break_start", "break_end", "clock_out"];

function useClock(): string | null {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTime(nowInTokyo().time);
    const id = setInterval(tick, 1000);
    const first = setTimeout(tick, 0);
    return () => {
      clearInterval(id);
      clearTimeout(first);
    };
  }, []);
  return time;
}

function PunchPage() {
  const { user } = useSession();
  const clock = useClock();
  const [status, setStatus] = useState<TodayStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(
    () =>
      apiFetch<TodayStatus>(`/api/users/${user.id}/today`)
        .then(setStatus)
        .catch((e) => setError(errorMessage(e))),
    [user.id],
  );

  useEffect(() => {
    load();
  }, [load]);

  async function handlePunch(type: PunchType) {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const next = await apiFetch<TodayStatus>(`/api/users/${user.id}/punches`, {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      setStatus(next);
      trackPunch(type);
      setMessage(`「${PUNCH_LABELS[type]}」を打刻しました。`);
    } catch (e) {
      setError(errorMessage(e));
      await load();
    } finally {
      setPending(false);
    }
  }

  const record = status?.record;

  return (
    <Stack gap="lg">
      <PageHeader title="打刻" />

      <Card withBorder py="xl">
        <Stack align="center" gap="xs">
          {status && (
            <Text c="dimmed">
              {status.date.replaceAll("-", "/")}（{WEEKDAY_LABELS[dayOfWeek(status.date)]}）
            </Text>
          )}
          <Text fz={48} fw={700} lh={1.2} style={{ fontVariantNumeric: "tabular-nums" }}>
            {clock ?? "--:--"}
          </Text>
          {status && (
            <Badge size="lg" variant="light" mt="xs">
              現在の状態：{PUNCH_STATE_LABELS[status.state]}
            </Badge>
          )}
        </Stack>
      </Card>

      <SimpleGrid cols={{ base: 2, md: 4 }}>
        {BUTTONS.map((type) => (
          <Button
            key={type}
            size="xl"
            h={72}
            variant={type === "clock_in" || type === "clock_out" ? "filled" : "default"}
            disabled={!status || pending || !status.allowed.includes(type)}
            onClick={() => handlePunch(type)}
          >
            {PUNCH_LABELS[type]}
          </Button>
        ))}
      </SimpleGrid>

      {message && <Notice kind="success">{message}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      <Card withBorder>
        <Title order={2} size="h4" mb="sm">
          今日の記録
        </Title>
        {!record ? (
          <Text c="dimmed">まだ打刻していません。</Text>
        ) : (
          <Table variant="vertical" withTableBorder={false} highlightOnHover={false}>
            <Table.Tbody>
              <Table.Tr>
                <Table.Th w={128}>出勤</Table.Th>
                <Table.Td>{record.clockIn ?? "—"}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Th>休憩</Table.Th>
                <Table.Td>
                  {record.breaks.length === 0
                    ? "—"
                    : record.breaks.map((b, i) => (
                        <Text span key={i} mr="md" inherit>
                          {b.start}〜{b.end ?? "（休憩中）"}
                        </Text>
                      ))}
                  {record.breaks.length > 0 && (
                    <Text span c="dimmed" inherit>
                      （合計 {formatDuration(calcBreakMinutes(record.breaks))}）
                    </Text>
                  )}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Th>退勤</Table.Th>
                <Table.Td>{record.clockOut ?? "—"}</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Stack>
  );
}

export default withSession(PunchPage);
