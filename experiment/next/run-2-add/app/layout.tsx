import "@mantine/core/styles.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  // 日本語の字形はファイルが多いので先読みしない（表示に使う分だけブラウザが取りに行く）
  preload: false,
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "勤怠管理",
  description: "小さな会社向けの勤怠管理アプリ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={notoSansJp.variable} {...mantineHtmlProps}>
      <head>
        {/* 保存済みのライト／ダークを描画前に反映して、ちらつきを防ぐ */}
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
