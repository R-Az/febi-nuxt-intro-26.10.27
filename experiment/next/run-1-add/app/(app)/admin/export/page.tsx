"use client";

import { Button, Container, Paper, Select, Stack, Text } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { IconDownload } from "@tabler/icons-react";
import { Suspense, useEffect, useState } from "react";
import { Loading } from "@/components/Loading";
import { ErrorAlert, SuccessAlert } from "@/components/Alert";
import { PageTitle } from "@/components/PageTitle";
import { apiDownload, apiFetch, errorMessage } from "@/lib/api-client";
import { currentMonthInJst } from "@/lib/time";
import type { PublicUser } from "@/lib/types";

// 今日の日付から初期表示の月（日）を決めるため、リクエスト時に描画する
export default function ExportPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ExportPageContent />
    </Suspense>
  );
}

function ExportPageContent() {
  const [employees, setEmployees] = useState<PublicUser[]>([]);
  const [month, setMonth] = useState(() => currentMonthInJst());
  const [userId, setUserId] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    apiFetch<{ employees: PublicUser[] }>("/api/admin/employees")
      .then((res) => setEmployees(res.employees))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  async function download() {
    setDownloading(true);
    setError(null);
    setMessage(null);
    try {
      const params = new URLSearchParams({ month, userId });
      await apiDownload(`/api/admin/export?${params}`, `attendance_${month}_${userId}.csv`);
      setMessage("CSV をダウンロードしました。");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Container size="sm" px={0} mx={0}>
      <PageTitle>CSV出力</PageTitle>
      <Stack>
        <ErrorAlert message={error} />
        <SuccessAlert message={message} />
        <Paper withBorder p="lg">
          <Stack align="flex-start">
            <MonthPickerInput
              label="月"
              value={`${month}-01`}
              onChange={(value) => value && setMonth(value.slice(0, 7))}
              valueFormat="YYYY年M月"
              w={220}
            />
            <Select
              label="従業員"
              value={userId}
              onChange={(value) => value && setUserId(value)}
              data={[
                { value: "all", label: "全員" },
                ...employees.map((e) => ({ value: e.id, label: `${e.id} ${e.name}` })),
              ]}
              allowDeselect={false}
              w={220}
            />
            <Button onClick={download} loading={downloading} leftSection={<IconDownload size={16} />}>
              CSV をダウンロード
            </Button>
          </Stack>
        </Paper>
        <Stack gap={2}>
          <Text size="xs" c="dimmed">
            列：従業員ID, 氏名, 日付, 出勤, 退勤, 休憩(分), 実働(分), 残業(分), 備考
          </Text>
          <Text size="xs" c="dimmed">
            文字コードは UTF-8（BOM 付き）です。Excel でそのまま開けます。出勤の記録がある日だけを出力します。
          </Text>
        </Stack>
      </Stack>
    </Container>
  );
}
