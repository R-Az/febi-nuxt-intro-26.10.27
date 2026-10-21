"use client";

import { Button, Card, Center, Group, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ColorSchemeToggle } from "@/components/color-scheme-toggle";
import { Notice } from "@/components/ui";
import { apiFetch, errorMessage } from "@/lib/client/api";
import type { PublicUser } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { user } = await apiFetch<{ user: PublicUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.replace(user.role === "admin" ? "/admin" : "/punch");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Center component="main" style={{ flex: 1 }} px="md" py={64}>
      <Card withBorder shadow="sm" padding="lg" w="100%" maw={384}>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Group justify="space-between" wrap="nowrap">
              <Title order={1} size="h3">
                勤怠管理 ログイン
              </Title>
              <ColorSchemeToggle />
            </Group>
            <TextInput
              type="email"
              label="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              autoComplete="username"
              required
            />
            <PasswordInput
              label="パスワード"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              autoComplete="current-password"
              required
            />
            {error && <Notice kind="error">{error}</Notice>}
            <Button type="submit" fullWidth loading={submitting}>
              ログイン
            </Button>
          </Stack>
        </form>
      </Card>
    </Center>
  );
}
