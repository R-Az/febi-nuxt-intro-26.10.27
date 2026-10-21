"use client";

import { AppShell, Container } from "@mantine/core";
import { AppHeader } from "@/components/AppHeader";

/** ログイン後の画面の枠（上部のヘッダーと本文）。 */
export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={{ height: 56 }} padding="xl">
      <AppShell.Header>
        <AppHeader />
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg" px={0}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
