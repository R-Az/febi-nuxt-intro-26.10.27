"use client";

import { ActionIcon, Box, Tooltip, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

const LABEL = "ライトモード・ダークモードを切り替える";

/**
 * ライトモードとダークモードを切り替えるボタン。選んだモードはブラウザに保存される。
 * 今のモードはサーバーでは分からないので、ラベルは固定にし、アイコンの出し分けは CSS（lightHidden / darkHidden）に任せる。
 */
export function ColorSchemeToggle() {
  const { toggleColorScheme } = useMantineColorScheme();

  return (
    <Tooltip label={LABEL}>
      <ActionIcon variant="default" size="lg" aria-label={LABEL} onClick={toggleColorScheme}>
        <Box component="span" lightHidden>
          <IconSun size={18} stroke={1.5} display="block" />
        </Box>
        <Box component="span" darkHidden>
          <IconMoon size={18} stroke={1.5} display="block" />
        </Box>
      </ActionIcon>
    </Tooltip>
  );
}
