"use client";

import {
  Alert,
  Anchor,
  Button,
  Fieldset,
  Group,
  List,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { ApiClientError, apiFetch, errorMessage } from "@/lib/client/api";
import { dayOfWeek, WEEKDAY_LABELS } from "@/lib/time";
import type { DaySummary, PublicUser } from "@/lib/types";

type BreakInput = { start: string; end: string };

/** 1日分の勤怠を修正するダイアログ。入力チェックはサーバー側で行い、エラーをそのまま表示する。 */
export function RecordEditor({
  user,
  date,
  summary,
  onClose,
  onSaved,
}: {
  user: PublicUser;
  date: string;
  summary: DaySummary | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [clockIn, setClockIn] = useState(summary?.clockIn ?? "");
  const [clockOut, setClockOut] = useState(summary?.clockOut ?? "");
  const [breaks, setBreaks] = useState<BreakInput[]>(
    summary?.breaks.map((b) => ({ start: b.start, end: b.end ?? "" })) ?? [],
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const dateLabel = `${date.replaceAll("-", "/")}（${WEEKDAY_LABELS[dayOfWeek(date)]}）`;

  function updateBreak(index: number, field: keyof BreakInput, value: string) {
    setBreaks((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  }

  async function save(body: { clockIn: string; clockOut: string; breaks: BreakInput[] }) {
    setSaving(true);
    setErrors([]);
    try {
      await apiFetch(`/api/admin/attendance/${user.id}/${date}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      const deleted = !body.clockIn && !body.clockOut && body.breaks.length === 0;
      onSaved(`${user.name}さんの ${dateLabel} の勤怠を${deleted ? "削除" : "保存"}しました。`);
    } catch (e) {
      if (e instanceof ApiClientError && e.details.length > 0) {
        setErrors([e.message, ...e.details]);
      } else {
        setErrors([errorMessage(e)]);
      }
      setSaving(false);
    }
  }

  return (
    // 修正のダイアログの上に、削除の確認ダイアログを重ねて出す
    <Modal.Stack>
      <Modal
        stackId="editor"
        opened
        onClose={onClose}
        closeOnClickOutside={!saving}
        closeOnEscape={!saving}
        size="lg"
        title={`勤怠の修正：${user.name}・${dateLabel}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save({ clockIn, clockOut, breaks });
          }}
        >
          <Stack gap="md">
            <SimpleGrid cols={2}>
              <TextInput
                type="time"
                label="出勤"
                value={clockIn}
                onChange={(e) => setClockIn(e.currentTarget.value)}
                data-autofocus
              />
              <TextInput
                type="time"
                label="退勤"
                value={clockOut}
                onChange={(e) => setClockOut(e.currentTarget.value)}
              />
            </SimpleGrid>

            <Fieldset legend="休憩" variant="unstyled">
              <Stack gap="xs">
                {breaks.length === 0 && (
                  <Text size="sm" c="dimmed">
                    休憩はありません。
                  </Text>
                )}
                {breaks.map((b, i) => (
                  <Group key={i} gap="xs" wrap="nowrap">
                    <TextInput
                      type="time"
                      aria-label={`休憩${i + 1} 開始`}
                      value={b.start}
                      onChange={(e) => updateBreak(i, "start", e.currentTarget.value)}
                    />
                    <Text span>〜</Text>
                    <TextInput
                      type="time"
                      aria-label={`休憩${i + 1} 終了`}
                      value={b.end}
                      onChange={(e) => updateBreak(i, "end", e.currentTarget.value)}
                    />
                    <Anchor
                      component="button"
                      type="button"
                      size="sm"
                      c="red"
                      onClick={() => setBreaks((prev) => prev.filter((_, j) => j !== i))}
                    >
                      削除
                    </Anchor>
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
            </Fieldset>

            <Text size="xs" c="dimmed">
              退勤を空欄で保存すると「打刻漏れ」のままになります。すべて空欄で保存すると、その日の記録を削除します。
            </Text>

            {errors.length > 0 && (
              <Alert color="red" variant="light" role="alert">
                <List size="sm">
                  {errors.map((err, i) => (
                    <List.Item key={i}>{err}</List.Item>
                  ))}
                </List>
              </Alert>
            )}

            <Group justify="space-between">
              {summary ? (
                <Button
                  variant="outline"
                  color="red"
                  disabled={saving}
                  onClick={() => setConfirmingDelete(true)}
                >
                  記録を削除
                </Button>
              ) : (
                <span />
              )}
              <Group gap="xs">
                <Button variant="default" onClick={onClose} disabled={saving}>
                  キャンセル
                </Button>
                <Button type="submit" loading={saving}>
                  保存
                </Button>
              </Group>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        stackId="confirm-delete"
        opened={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title="記録の削除"
        size="sm"
        centered
      >
        <Text size="sm">この日の記録を削除します。よろしいですか？</Text>
        <Group justify="flex-end" gap="xs" mt="lg">
          <Button variant="default" onClick={() => setConfirmingDelete(false)}>
            やめる
          </Button>
          <Button
            color="red"
            onClick={() => {
              setConfirmingDelete(false);
              save({ clockIn: "", clockOut: "", breaks: [] });
            }}
          >
            削除する
          </Button>
        </Group>
      </Modal>
    </Modal.Stack>
  );
}
