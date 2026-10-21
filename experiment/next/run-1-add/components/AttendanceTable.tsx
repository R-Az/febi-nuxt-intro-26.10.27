"use client";

import { Badge, Button, Paper, Table, Text } from "@mantine/core";
import { STATUS_LABEL } from "@/lib/attendance";
import { datesInMonth, dayOfWeek, formatDateShort, formatDuration } from "@/lib/time";
import type { AttendanceRow, MonthTotals } from "@/lib/types";

type Props = {
  month: string;
  rows: AttendanceRow[];
  totals: MonthTotals;
  /** 渡すと各行に「修正」ボタンを出す（管理者用） */
  onEdit?: (date: string, row: AttendanceRow | undefined) => void;
  editableUntil?: string;
};

function breakText(row: AttendanceRow): string {
  if (row.breaks.length === 0) return "—";
  return row.breaks.map((b) => `${b.start}〜${b.end ?? ""}`).join(", ");
}

/** 土曜は青、日曜は赤（日付の文字色。ライト・ダークのどちらでも読める色をテーマから選ぶ） */
function weekendColor(date: string): "red" | "blue" | undefined {
  const w = dayOfWeek(date);
  return w === 0 ? "red" : w === 6 ? "blue" : undefined;
}

export function AttendanceTable({ month, rows, totals, onEdit, editableUntil }: Props) {
  const byDate = new Map(rows.map((r) => [r.date, r]));

  return (
    <Paper withBorder>
      <Table.ScrollContainer minWidth={760}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>日付</Table.Th>
              <Table.Th>出勤</Table.Th>
              <Table.Th>退勤</Table.Th>
              <Table.Th>休憩</Table.Th>
              <Table.Th ta="right">休憩時間</Table.Th>
              <Table.Th ta="right">実働時間</Table.Th>
              <Table.Th ta="right">残業時間</Table.Th>
              <Table.Th>備考</Table.Th>
              {onEdit && <Table.Th />}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {datesInMonth(month).map((date) => {
              const row = byDate.get(date);
              const weekend = weekendColor(date);
              return (
                <Table.Tr key={date} bg={weekend && "var(--mantine-color-default-hover)"}>
                  <Table.Td c={weekend}>{formatDateShort(date)}</Table.Td>
                  <Table.Td>{row?.clockIn ?? ""}</Table.Td>
                  <Table.Td>{row ? (row.clockOut ?? "—") : ""}</Table.Td>
                  <Table.Td c="dimmed">{row ? breakText(row) : ""}</Table.Td>
                  <Table.Td ta="right">{row ? formatDuration(row.breakMinutes) : ""}</Table.Td>
                  <Table.Td ta="right">{row?.workMinutes != null ? formatDuration(row.workMinutes) : ""}</Table.Td>
                  <Table.Td ta="right">
                    {row?.overtimeMinutes != null ? formatDuration(row.overtimeMinutes) : ""}
                  </Table.Td>
                  <Table.Td>
                    {row && row.status === "missing_clock_out" && (
                      <Badge color="red" variant="light">
                        {STATUS_LABEL.missing_clock_out}
                      </Badge>
                    )}
                    {row && row.status === "in_progress" && (
                      <Badge color="yellow" variant="light">
                        {STATUS_LABEL.in_progress}
                      </Badge>
                    )}
                  </Table.Td>
                  {onEdit && (
                    <Table.Td ta="right">
                      {(!editableUntil || date <= editableUntil) && (
                        <Button size="compact-xs" variant="default" onClick={() => onEdit(date, row)}>
                          修正
                        </Button>
                      )}
                    </Table.Td>
                  )}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
          <Table.Tfoot fw={700}>
            <Table.Tr>
              <Table.Td>合計</Table.Td>
              <Table.Td colSpan={3}>出勤日数 {totals.workDays} 日</Table.Td>
              <Table.Td ta="right">{formatDuration(totals.breakMinutes)}</Table.Td>
              <Table.Td ta="right">{formatDuration(totals.workMinutes)}</Table.Td>
              <Table.Td ta="right">{formatDuration(totals.overtimeMinutes)}</Table.Td>
              <Table.Td colSpan={onEdit ? 2 : 1}>
                {totals.missingCount > 0 && (
                  <Text span inherit c="red">
                    打刻漏れ {totals.missingCount} 件
                  </Text>
                )}
              </Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}
