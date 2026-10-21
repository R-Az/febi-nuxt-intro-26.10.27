"use client";

import { Button, Container, Paper, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ErrorAlert, SuccessAlert } from "@/components/Alert";
import { PageTitle } from "@/components/PageTitle";
import { trackPunch } from "@/lib/analytics";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { PUNCH_LABEL, PUNCH_STATE_LABEL } from "@/lib/punch";
import { formatDateShort, formatDuration } from "@/lib/time";
import type { AttendanceRow, PunchAction, PunchState } from "@/lib/types";

type TodayResponse = {
  date: string;
  now: string;
  state: PunchState;
  allowedActions: PunchAction[];
  record: AttendanceRow | null;
};

const ACTIONS: PunchAction[] = ["clock_in", "break_start", "break_end", "clock_out"];

const clockFormat = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function subscribeClock(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

/** 日本時間の現在時刻（表示用）。サーバー側の描画では空文字。 */
function useClock(): string {
  return useSyncExternalStore(
    subscribeClock,
    () => clockFormat.format(new Date()),
    () => "",
  );
}

function fetchToday() {
  return apiFetch<TodayResponse>("/api/attendance/today");
}

export default function PunchPage() {
  const clock = useClock();
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchToday()
      .then((res) => !cancelled && setToday(res))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  async function punch(action: PunchAction) {
    setSending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch<TodayResponse>("/api/attendance/punch", {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      setToday(res);
      trackPunch(action);
      setMessage(`${res.now} に「${PUNCH_LABEL[action]}」を打刻しました。`);
    } catch (err) {
      setError(errorMessage(err));
      // 別の画面で打刻した場合などに備えて、最新の状態を取り直す
      setToday(await fetchToday().catch(() => today));
    } finally {
      setSending(false);
    }
  }

  const record = today?.record;

  return (
    <Container size="sm" px={0}>
      <PageTitle>打刻</PageTitle>
      <Stack>
        <Paper withBorder p="xl" ta="center">
          <Text c="dimmed">{today ? formatDateShort(today.date) : "\u00a0"}</Text>
          <Text fz={48} fw={700} lh={1.2} my="xs" style={{ fontVariantNumeric: "tabular-nums" }}>
            {clock || "\u00a0"}
          </Text>
          <Text mb="xl">
            現在の状態：
            <Text span fw={700}>
              {today ? PUNCH_STATE_LABEL[today.state] : "読み込み中…"}
            </Text>
          </Text>
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            {ACTIONS.map((action) => (
              <Button
                key={action}
                size="xl"
                onClick={() => punch(action)}
                disabled={!today || !today.allowedActions.includes(action) || sending}
              >
                {PUNCH_LABEL[action]}
              </Button>
            ))}
          </SimpleGrid>
          {/* メッセージでボタンの位置がずれないよう、ボタンの下に出す */}
          <Stack mt="lg" mih={48} ta="left" gap="xs">
            <ErrorAlert message={error} />
            <SuccessAlert message={message} />
          </Stack>
        </Paper>

        <Paper withBorder p="lg">
          <Title order={2} size="h5" mb="sm">
            今日の記録
          </Title>
          {record ? (
            <Table variant="vertical" layout="fixed" highlightOnHover={false} maw={560}>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th w={128}>出勤</Table.Th>
                  <Table.Td>{record.clockIn}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>休憩</Table.Th>
                  <Table.Td>
                    {record.breaks.length === 0
                      ? "—"
                      : record.breaks.map((b) => `${b.start}〜${b.end ?? "（休憩中）"}`).join(", ")}
                    {record.breakMinutes > 0 && `（合計 ${formatDuration(record.breakMinutes)}）`}
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>退勤</Table.Th>
                  <Table.Td>{record.clockOut ?? "—"}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>実働時間</Table.Th>
                  <Table.Td>{record.workMinutes != null ? formatDuration(record.workMinutes) : "—"}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>残業時間</Table.Th>
                  <Table.Td>{record.overtimeMinutes != null ? formatDuration(record.overtimeMinutes) : "—"}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          ) : (
            <Text size="sm" c="dimmed">
              まだ打刻していません。
            </Text>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
