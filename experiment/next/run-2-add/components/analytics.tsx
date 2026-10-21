"use client";

import { Affix, Button, Group, Paper, Text } from "@mantine/core";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useSyncExternalStore } from "react";
import {
  GA_MEASUREMENT_ID,
  getConsent,
  getServerConsent,
  setConsent,
  subscribeConsent,
} from "@/lib/client/analytics";

/**
 * 同意したときだけ Google Analytics を読み込み、まだ選んでいなければ同意のバナーを出す。
 * gtag.js は next/script の afterInteractive で読み込むので、最初の画面の表示を待たせない。
 */
export function Analytics() {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, getServerConsent);

  if (consent === "granted") return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
  if (consent === "unset") return <ConsentBanner />;
  return null;
}

function ConsentBanner() {
  return (
    <Affix position={{ bottom: 16, left: 16, right: 16 }}>
      <Paper
        withBorder
        shadow="md"
        p="md"
        maw={720}
        mx="auto"
        role="region"
        aria-label="アクセス解析の同意"
      >
        <Text size="sm">
          サービス改善のため、Google Analytics で利用状況（画面の表示や打刻の操作）を計測します。
          同意いただいた場合にだけ計測を始めます。
        </Text>
        <Group justify="flex-end" mt="sm" gap="xs">
          <Button variant="default" size="xs" onClick={() => setConsent("denied")}>
            同意しない
          </Button>
          <Button size="xs" onClick={() => setConsent("granted")}>
            同意する
          </Button>
        </Group>
      </Paper>
    </Affix>
  );
}
