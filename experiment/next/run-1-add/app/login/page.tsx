"use client";

import { Box, Button, Center, Group, Paper, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { useState } from "react";
import { ErrorAlert } from "@/components/Alert";
import { ColorSchemeToggle } from "@/components/ColorSchemeToggle";
import { apiFetch, errorMessage } from "@/lib/api-client";
import type { PublicUser } from "@/lib/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { user } = await apiFetch<{ user: PublicUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      window.location.href = user.role === "admin" ? "/admin" : "/punch";
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Box component="main" mih="100vh" p="md">
      <Group justify="flex-end">
        <ColorSchemeToggle />
      </Group>
      <Center py={64}>
        <Paper withBorder shadow="sm" p="xl" w="100%" maw={384}>
          <Title order={1} size="h3" ta="center" mb="lg">
            勤怠管理 ログイン
          </Title>
          <form onSubmit={handleSubmit}>
            <Stack>
              <ErrorAlert message={error} />
              <TextInput
                label="メールアドレス"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
              />
              <PasswordInput
                label="パスワード"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
              <Button type="submit" fullWidth size="md" loading={submitting}>
                ログイン
              </Button>
            </Stack>
          </form>
        </Paper>
      </Center>
    </Box>
  );
}
