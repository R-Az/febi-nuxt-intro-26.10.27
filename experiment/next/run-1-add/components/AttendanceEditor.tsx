"use client";

import { ActionIcon, Alert, Button, Group, Input, Modal, Stack, Text } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { ErrorAlert } from "@/components/Alert";
import { ApiError, apiFetch, errorMessage } from "@/lib/api-client";
import { formatDateShort } from "@/lib/time";
import type { AttendanceRow } from "@/lib/types";

type Props = {
  userId: string;
  userName: string;
  date: string;
  row?: AttendanceRow;
  onCancel: () => void;
  onSaved: (message: string) => void;
};

type BreakInput = { start: string; end: string };

/**
 * 管理者が 1 日分の出勤・退勤・休憩を修正するモーダル。表示している間だけ描画する。
 * 入力チェックはサーバー側で行い、結果をここに出す。
 */
export function AttendanceEditor({ userId, userName, date, row, onCancel, onSaved }: Props) {
  const [clockIn, setClockIn] = useState(row?.clockIn ?? "");
  const [clockOut, setClockOut] = useState(row?.clockOut ?? "");
  const [breaks, setBreaks] = useState<BreakInput[]>(
    row && row.breaks.length > 0
      ? row.breaks.map((b) => ({ start: b.start, end: b.end ?? "" }))
      : [{ start: "", end: "" }],
  );
  const [error, setError] = useState<{ message: string; details: string[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function submit(body: { clockIn: string; clockOut: string; breaks: BreakInput[] }, successText: string) {
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/admin/attendance", {
        method: "PUT",
        body: JSON.stringify({ userId, date, ...body }),
      });
      onSaved(successText);
    } catch (err) {
      setError({ message: errorMessage(err), details: err instanceof ApiError ? err.details : [] });
      setSaving(false);
      setConfirmingDelete(false);
    }
  }

  function updateBreak(index: number, patch: Partial<BreakInput>) {
    setBreaks((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  const title = `${userName}さん ${formatDateShort(date)} の勤怠`;

  return (
    <Modal opened onClose={() => !saving && onCancel()} title={`${title}を修正`} size="lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit({ clockIn, clockOut, breaks }, `${title}を保存しました。`);
        }}
      >
        <Stack>
          {error && <ErrorAlert message={error.message} details={error.details} />}
          <Group align="flex-start" grow>
            <TimeInput label="出勤" value={clockIn} onChange={(e) => setClockIn(e.currentTarget.value)} />
            <TimeInput
              label="退勤"
              description="空欄なら打刻漏れのまま"
              inputWrapperOrder={["label", "input", "description", "error"]}
              value={clockOut}
              onChange={(e) => setClockOut(e.currentTarget.value)}
            />
          </Group>

          <Input.Wrapper label="休憩">
            <Stack gap="xs" mt={4}>
              {breaks.map((b, i) => (
                <Group key={i} gap="xs" wrap="nowrap">
                  <TimeInput
                    value={b.start}
                    onChange={(e) => updateBreak(i, { start: e.currentTarget.value })}
                    aria-label={`休憩${i + 1}の開始`}
                  />
                  <Text>〜</Text>
                  <TimeInput
                    value={b.end}
                    onChange={(e) => updateBreak(i, { end: e.currentTarget.value })}
                    aria-label={`休憩${i + 1}の終了`}
                  />
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => setBreaks((prev) => prev.filter((_, j) => j !== i))}
                    aria-label={`休憩${i + 1}を削除`}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              <Group>
                <Button
                  variant="subtle"
                  size="compact-sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => setBreaks((prev) => [...prev, { start: "", end: "" }])}
                >
                  休憩を追加
                </Button>
              </Group>
            </Stack>
          </Input.Wrapper>

          {confirmingDelete ? (
            <Alert color="red" variant="light" title={`${title}を削除します。よろしいですか？`}>
              <Group gap="xs" mt="xs">
                <Button
                  color="red"
                  loading={saving}
                  onClick={() => submit({ clockIn: "", clockOut: "", breaks: [] }, `${title}を削除しました。`)}
                >
                  削除する
                </Button>
                <Button variant="default" disabled={saving} onClick={() => setConfirmingDelete(false)}>
                  やめる
                </Button>
              </Group>
            </Alert>
          ) : (
            <Group gap="sm" pt="xs">
              <Button type="submit" loading={saving}>
                保存
              </Button>
              <Button variant="default" onClick={onCancel} disabled={saving}>
                キャンセル
              </Button>
              {row && (
                <Button variant="subtle" color="red" ml="auto" disabled={saving} onClick={() => setConfirmingDelete(true)}>
                  この日の勤怠を削除
                </Button>
              )}
            </Group>
          )}
        </Stack>
      </form>
    </Modal>
  );
}
