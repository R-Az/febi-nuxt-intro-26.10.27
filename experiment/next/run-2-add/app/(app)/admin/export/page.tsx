"use client";

import { Button, Card, Group, Input, NativeSelect, Stack, Text } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSession, withSession } from "@/components/app-shell";
import { MonthPicker } from "@/components/month-picker";
import { Notice, PageHeader } from "@/components/ui";
import { CSV_HEADER } from "@/lib/attendance/csv";
import { apiDownload, apiFetch, errorMessage } from "@/lib/client/api";
import type { PublicUser } from "@/lib/types";

function AdminExportPage() {
  const { today } = useSession();
  const currentMonth = today.slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [userId, setUserId] = useState("all");
  const [employees, setEmployees] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    apiFetch<{ employees: PublicUser[] }>("/api/admin/employees")
      .then((res) => setEmployees(res.employees))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  async function download() {
    setDownloading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ month, userId });
      const { blob, filename } = await apiDownload(`/api/admin/export?${params}`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Stack gap="lg">
      <PageHeader title="CSV出力" />
      <Card withBorder>
        <Stack gap="md" align="flex-start">
          <Input.Wrapper label="対象月" labelElement="div">
            <MonthPicker value={month} max={currentMonth} onChange={setMonth} />
          </Input.Wrapper>
          <NativeSelect
            label="従業員"
            value={userId}
            onChange={(e) => setUserId(e.currentTarget.value)}
            data={[
              { value: "all", label: "全員" },
              ...employees.map((u) => ({ value: u.id, label: `${u.id} ${u.name}` })),
            ]}
          />
          <Group>
            <Button
              onClick={download}
              loading={downloading}
              leftSection={<IconDownload size={16} />}
            >
              CSVをダウンロード
            </Button>
          </Group>
          {error && <Notice kind="error">{error}</Notice>}
        </Stack>
      </Card>
      <Stack gap={4}>
        <Text size="sm" c="dimmed">
          列：{CSV_HEADER.join(", ")}
        </Text>
        <Text size="sm" c="dimmed">
          勤怠の記録がある日を出力します。文字コードは UTF-8（BOM付き）なので、Excel
          でそのまま開けます。打刻漏れの日は実働・残業を空欄にし、備考に「打刻漏れ」と入れます。
        </Text>
      </Stack>
    </Stack>
  );
}

export default withSession(AdminExportPage);
