"use client";

import { Badge, Button, Container, Group, Text } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ColorSchemeToggle } from "@/components/ColorSchemeToggle";
import { apiFetch } from "@/lib/api-client";
import type { PublicUser } from "@/lib/types";

const NAV = {
  employee: [
    { href: "/punch", label: "打刻" },
    { href: "/attendance", label: "勤怠一覧" },
  ],
  admin: [
    { href: "/admin", label: "月次一覧" },
    { href: "/admin/attendance", label: "勤怠の修正" },
    { href: "/admin/missing", label: "打刻漏れ" },
    { href: "/admin/export", label: "CSV出力" },
  ],
} as const;

export function AppHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    apiFetch<{ user: PublicUser }>("/api/auth/me")
      .then((res) => setUser(res.user))
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    setLoggingOut(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      // 前のユーザーの画面の状態（裏で保持されている画面も含む）を残さないよう、再読み込みで移動する
      window.location.replace("/login");
    }
  }

  return (
    <Container size="lg" h="100%">
      <Group h="100%" gap="xl" wrap="nowrap">
        <Text fw={700}>勤怠管理</Text>
        <Group component="nav" gap={4} flex={1} wrap="nowrap">
          {user &&
            NAV[user.role].map((item) => {
              const active = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  variant={active ? "filled" : "subtle"}
                  color={active ? undefined : "gray"}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Button>
              );
            })}
        </Group>
        <Group gap="sm" wrap="nowrap">
          {user && (
            <Group gap={6} wrap="nowrap">
              <Text size="sm">{user.name}</Text>
              <Badge variant="default" radius="sm">
                {user.role === "admin" ? "管理者" : "従業員"}
              </Badge>
            </Group>
          )}
          <ColorSchemeToggle />
          {user && (
            <Button variant="default" onClick={logout} loading={loggingOut}>
              ログアウト
            </Button>
          )}
        </Group>
      </Group>
    </Container>
  );
}
