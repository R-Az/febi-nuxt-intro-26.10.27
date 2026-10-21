import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { Providers } from "@/components/Providers";

// 本文の書体。テーマ（components/theme.ts）がこの CSS 変数を参照する。
// 日本語の文字は必要な範囲だけを表示時に読み込むので、先読みはしない。
const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "勤怠管理",
  description: "小規模な会社向けの勤怠管理アプリ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={notoSansJp.variable} {...mantineHtmlProps}>
      <head>
        {/* 保存されたライト・ダークの設定を、最初の描画の前に反映する */}
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
