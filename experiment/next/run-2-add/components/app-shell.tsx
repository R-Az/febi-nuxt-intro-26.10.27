"use client";

import { Badge, Box, Button, Container, Group, Text, Title } from "@mantine/core";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { ColorSchemeToggle } from "@/components/color-scheme-toggle";
import { Loading, Notice } from "@/components/ui";
import { apiFetch, errorMessage } from "@/lib/client/api";
import type { PublicUser, Role } from "@/lib/types";

type Session = { user: PublicUser; today: string };

const SessionContext = createContext<Session | null>(null);

/** ログイン中のユーザーと、サーバー基準の今日の日付。withSession で包んだ画面の中でだけ使える。 */
export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession は withSession で包んだ画面の中で使ってください。");
  return session;
}

/** ログイン中のユーザーを読み込むまで「読み込み中」を出し、読み込めたら画面を表示する。 */
export function withSession(Page: React.ComponentType) {
  return function SessionPage() {
    const session = useContext(SessionContext);
    if (!session) return <Loading />;
    return <Page />;
  };
}

const NAV: Record<Role, { href: string; label: string }[]> = {
  employee: [
    { href: "/punch", label: "打刻" },
    { href: "/attendance", label: "勤怠一覧" },
  ],
  admin: [
    { href: "/admin", label: "月次一覧" },
    { href: "/admin/attendance", label: "勤怠修正" },
    { href: "/admin/export", label: "CSV出力" },
    { href: "/admin/missing-punches", label: "打刻漏れ検出" },
  ],
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Session>("/api/auth/me")
      .then(setSession)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <Box style={{ flex: 1 }}>
      <Box
        component="header"
        style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
      >
        <Container size="xl">
          <Group gap="sm" py="xs">
            <Title order={1} size="h4" mr="md">
              勤怠管理
            </Title>
            <Group component="nav" gap={4} aria-label="メニュー">
              {session &&
                NAV[session.user.role].map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Button
                      key={item.href}
                      component={Link}
                      href={item.href}
                      variant={active ? "light" : "subtle"}
                      color={active ? undefined : "gray"}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Button>
                  );
                })}
            </Group>
            <Group ml="auto" gap="sm">
              {session && (
                <Group gap={6}>
                  <Text size="sm">{session.user.name}</Text>
                  <Badge variant="light" color="gray">
                    {session.user.role === "admin" ? "管理者" : "従業員"}
                  </Badge>
                </Group>
              )}
              <ColorSchemeToggle />
              <Button variant="default" onClick={logout}>
                ログアウト
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>
      <Container component="main" size="xl" py="xl">
        {error ? (
          <Notice kind="error">{error}</Notice>
        ) : (
          <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
        )}
      </Container>
    </Box>
  );
}
