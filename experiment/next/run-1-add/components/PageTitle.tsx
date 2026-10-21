import { Group, Title } from "@mantine/core";

export function PageTitle({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <Group justify="space-between" gap="md" mb="lg">
      <Title order={1} size="h3">
        {children}
      </Title>
      {actions}
    </Group>
  );
}
