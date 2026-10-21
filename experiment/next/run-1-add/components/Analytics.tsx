"use client";

import { Affix, Button, Group, Paper, Text } from "@mantine/core";
import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import { GA_MEASUREMENT_ID, getConsent, initAnalytics, setConsent, subscribeConsent } from "@/lib/analytics";

/** サーバー側の描画とハイドレーションの間は「まだ分からない」として、バナーもスクリプトも出さない */
const UNKNOWN = "unknown" as const;

function useConsent() {
  return useSyncExternalStore(subscribeConsent, getConsent, () => UNKNOWN);
}

/**
 * Google Analytics の同意バナーと読み込み。
 * 同意するまでは gtag.js を読み込まない。同意したら（または以前に同意していたら）、
 * 画面の表示が終わってから（afterInteractive）gtag.js を読み込んで計測を始める。
 */
export function Analytics() {
  const consent = useConsent();
  const granted = consent === "granted";

  useEffect(() => {
    if (granted) initAnalytics();
  }, [granted]);

  return (
    <>
      {granted && (
        <Script
          id="gtag-js"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
      )}
      {consent === null && <ConsentBanner />}
    </>
  );
}

function ConsentBanner() {
  return (
    <Affix position={{ bottom: 16, left: 16, right: 16 }}>
      <Paper withBorder shadow="md" p="md" maw={720} mx="auto" role="region" aria-label="アクセス解析への同意">
        <Group justify="space-between" gap="md">
          <Text size="sm" flex="1 1 20rem">
            使い勝手の改善のため、Google Analytics で画面の利用状況（打刻の回数など）を計測します。同意いただいた場合にだけ計測を始めます。
          </Text>
          <Group gap="xs">
            <Button variant="default" onClick={() => setConsent("denied")}>
              同意しない
            </Button>
            <Button onClick={() => setConsent("granted")}>同意する</Button>
          </Group>
        </Group>
      </Paper>
    </Affix>
  );
}
