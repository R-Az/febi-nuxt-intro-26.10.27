"use client";

import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import "dayjs/locale/ja";
import { theme } from "@/components/theme";

/** 全画面で使う UI の設定（テーマ、ライト・ダーク、日付部品の言語）。 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <DatesProvider settings={{ locale: "ja", firstDayOfWeek: 0, weekendDays: [0, 6] }}>{children}</DatesProvider>
    </MantineProvider>
  );
}
