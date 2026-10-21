// 複数の画面で使う小さな表示部品。

import { Alert, Group, Loader, Text, Title } from "@mantine/core";

/** 読み込み中の表示。 */
export function Loading() {
  return (
    <Group gap="xs">
      <Loader size="sm" />
      <Text c="dimmed">読み込み中…</Text>
    </Group>
  );
}

/** 操作の結果（成功・失敗）のお知らせ。 */
export function Notice({ kind, children }: { kind: "success" | "error"; children: React.ReactNode }) {
  return kind === "error" ? (
    <Alert color="red" variant="light" role="alert">
      {children}
    </Alert>
  ) : (
    <Alert color="green" variant="light" role="status">
      {children}
    </Alert>
  );
}

/** 画面の見出し。右側に月の選択などの操作を置ける。 */
export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <Group justify="space-between" wrap="wrap" gap="md">
      <Title order={1} size="h2">
        {title}
      </Title>
      {children}
    </Group>
  );
}
