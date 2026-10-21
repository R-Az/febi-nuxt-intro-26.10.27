"use client";

import { MantineProvider } from "@mantine/core";
import { Analytics } from "@/components/analytics";
import { theme } from "@/lib/theme";

/** 全画面に効かせるもの：UI のテーマ（ライト・ダーク）と、アクセス解析。 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      {children}
      <Analytics />
    </MantineProvider>
  );
}
