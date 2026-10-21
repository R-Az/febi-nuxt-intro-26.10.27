import { Badge, Card, SimpleGrid, Table, Text } from "@mantine/core";
import { dayOfWeek, formatDuration, WEEKDAY_LABELS } from "@/lib/time";
import type { DayStatus, DaySummary, MonthlyAttendance, MonthTotals } from "@/lib/types";

const STATUS_BADGE: Record<DayStatus, { label: string; color: string } | null> = {
  complete: null,
  missing: { label: "打刻漏れ", color: "red" },
  working: { label: "勤務中", color: "blue" },
};

function StatusBadge({ status }: { status: DayStatus }) {
  const badge = STATUS_BADGE[status];
  if (!badge) return null;
  return (
    <Badge variant="light" color={badge.color}>
      {badge.label}
    </Badge>
  );
}

function duration(minutes: number | null, status: DayStatus): React.ReactNode {
  if (minutes !== null) return formatDuration(minutes);
  return status === "missing" ? (
    <Text span c="red" inherit>
      打刻漏れ
    </Text>
  ) : (
    "—"
  );
}

/** 曜日の色（日曜は赤、土曜は青）。 */
function weekdayColor(w: number): string | undefined {
  if (w === 0) return "red";
  if (w === 6) return "blue";
  return undefined;
}

export function TotalsSummary({ totals }: { totals: MonthTotals }) {
  const items = [
    { label: "出勤日数", value: `${totals.workDays}日` },
    { label: "休憩合計", value: formatDuration(totals.breakMinutes) },
    { label: "実働合計", value: formatDuration(totals.workMinutes) },
    { label: "残業合計", value: formatDuration(totals.overtimeMinutes) },
    { label: "打刻漏れ", value: `${totals.missingCount}件` },
  ];
  return (
    <SimpleGrid component="dl" cols={{ base: 2, md: 5 }} m={0}>
      {items.map((item) => (
        <Card key={item.label} withBorder padding="sm">
          <Text component="dt" size="xs" c="dimmed">
            {item.label}
          </Text>
          <Text component="dd" m={0} mt={4} fz="xl" fw={700}>
            {item.value}
          </Text>
        </Card>
      ))}
    </SimpleGrid>
  );
}

/** 月の日ごとの勤怠表。renderAction を渡すと右端に操作列を出す。 */
export function AttendanceTable({
  data,
  renderAction,
}: {
  data: MonthlyAttendance;
  renderAction?: (date: string, summary: DaySummary | null) => React.ReactNode;
}) {
  return (
    <Card withBorder padding={0}>
      <Table.ScrollContainer minWidth={640}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>日付</Table.Th>
              <Table.Th>出勤</Table.Th>
              <Table.Th>退勤</Table.Th>
              <Table.Th ta="right">休憩</Table.Th>
              <Table.Th ta="right">実働</Table.Th>
              <Table.Th ta="right">残業</Table.Th>
              <Table.Th>状態</Table.Th>
              {renderAction && <Table.Th />}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.days.map(({ date, summary }) => {
              const w = dayOfWeek(date);
              const weekend = w === 0 || w === 6;
              return (
                <Table.Tr key={date} bg={weekend ? "var(--mantine-color-default-hover)" : undefined}>
                  <Table.Td c={weekend ? "dimmed" : undefined}>
                    {date.slice(5).replace("-", "/")}
                    <Text span ml={4} c={weekdayColor(w)} inherit>
                      （{WEEKDAY_LABELS[w]}）
                    </Text>
                  </Table.Td>
                  <Table.Td>{summary?.clockIn ?? ""}</Table.Td>
                  <Table.Td>{summary?.clockOut ?? ""}</Table.Td>
                  <Table.Td ta="right">{summary ? formatDuration(summary.breakMinutes) : ""}</Table.Td>
                  <Table.Td ta="right">
                    {summary ? duration(summary.workMinutes, summary.status) : ""}
                  </Table.Td>
                  <Table.Td ta="right">
                    {summary ? duration(summary.overtimeMinutes, summary.status) : ""}
                  </Table.Td>
                  <Table.Td>{summary && <StatusBadge status={summary.status} />}</Table.Td>
                  {renderAction && <Table.Td ta="right">{renderAction(date, summary)}</Table.Td>}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
          <Table.Tfoot fw={700}>
            <Table.Tr>
              <Table.Td>合計</Table.Td>
              <Table.Td colSpan={2}>出勤 {data.totals.workDays}日</Table.Td>
              <Table.Td ta="right">{formatDuration(data.totals.breakMinutes)}</Table.Td>
              <Table.Td ta="right">{formatDuration(data.totals.workMinutes)}</Table.Td>
              <Table.Td ta="right">{formatDuration(data.totals.overtimeMinutes)}</Table.Td>
              <Table.Td>
                {data.totals.missingCount > 0 && `打刻漏れ ${data.totals.missingCount}件`}
              </Table.Td>
              {renderAction && <Table.Td />}
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}
