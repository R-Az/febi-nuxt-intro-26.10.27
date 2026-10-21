"use client";

import { ActionIcon, Box, Tooltip, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

/** ライトモードとダークモードを切り替える。選んだ値はブラウザに保存される。 */
export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light", { getInitialValueInEffect: true });

  return (
    <Tooltip label="ライト／ダークの切り替え">
      <ActionIcon
        variant="default"
        size="lg"
        aria-label="ライトモードとダークモードを切り替える"
        onClick={() => setColorScheme(computed === "dark" ? "light" : "dark")}
      >
        {/* 表示はCSSで出し分け、サーバーとブラウザで描画結果がずれないようにする */}
        <Box component={IconSun} size={18} stroke={1.5} darkHidden />
        <Box component={IconMoon} size={18} stroke={1.5} lightHidden />
      </ActionIcon>
    </Tooltip>
  );
}
