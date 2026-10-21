// 画面全体の見た目（Mantine のテーマ）。色・角の丸み・書体・表の詰め具合はここで一括して決める。
// 部品ごとに className や style で上書きせず、変えたいときはこのファイルを直す。

import { createTheme, Table, TableScrollContainer, virtualColor, type MantineColorsTuple } from "@mantine/core";

/**
 * ブランドカラー #0F766E を 7 番目に置いた 10 段階の色。
 * 0 が最も明るく、9 が最も暗い。
 */
const brand: MantineColorsTuple = [
  "#f0fdfa",
  "#ccfbf1",
  "#99f6e4",
  "#5eead4",
  "#2dd4bf",
  "#14b8a6",
  "#0d9488",
  "#0f766e", // ブランドカラー
  "#115e59",
  "#134e4a",
];

/** 本文の書体。next/font で読み込んだ Noto Sans JP を CSS 変数で受け取る（app/layout.tsx）。 */
const fontFamily =
  'var(--font-noto-sans-jp), "Hiragino Sans", "Hiragino Kaku Gothic ProN", Meiryo, system-ui, sans-serif';

export const theme = createTheme({
  colors: {
    brand,
    // 主色。ライト・ダークで同じ brand を指す「仮想の色」にしておくと、
    // ボタンの文字色（白か黒か）をモードごとに選び直してくれる。
    primary: virtualColor({ name: "primary", light: "brand", dark: "brand" }),
  },
  primaryColor: "primary",
  // ライトモードはブランドカラーそのもの（白文字とのコントラスト 5.5:1）。
  // ダークモードは暗い背景で沈まないよう明るい段階にする（背景とのコントラスト 6.2:1、黒文字とのコントラスト 8.4:1）。
  primaryShade: { light: 7, dark: 5 },
  // 明るい色のボタンでは文字を黒にする（ダークモードの主色のボタンで効く）
  autoContrast: true,

  // ボタン・入力欄・カードなどの角の丸みを 4px にそろえる
  radius: { xs: "2px", sm: "4px" },
  defaultRadius: "sm",

  fontFamily,
  headings: { fontFamily },

  components: {
    // 表は行の高さを詰めて、1 画面に多くの行を出す
    Table: Table.extend({
      defaultProps: {
        verticalSpacing: 4,
        horizontalSpacing: "sm",
        fz: "sm",
        tabularNums: true,
        highlightOnHover: true,
      },
    }),
    // 横にはみ出す表はブラウザ標準のスクロールにする（独自スクロールバーぶんの余白を表の下に作らない）
    TableScrollContainer: TableScrollContainer.extend({
      defaultProps: { type: "native" },
    }),
  },
});
