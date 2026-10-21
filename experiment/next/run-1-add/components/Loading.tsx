import { Group, Loader, Text } from "@mantine/core";

export function Loading() {
  return (
    <Group gap="xs">
      <Loader size="xs" />
      <Text size="sm" c="dimmed">
        読み込み中…
      </Text>
    </Group>
  );
}
