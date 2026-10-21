// 画面全体の見た目（Mantine のテーマ）。色・角の丸み・書体・表の詰め具合はここだけで決め、部品ごとには書かない。

import { createTheme, type MantineColorsTuple, Table, virtualColor } from "@mantine/core";

/**
 * ブランドカラー #0F766E を 7 番に置いた10段階の色。
 * 明るい側・暗い側の段は、同じ色相（ティール）で明度を変えたもの。
 */
const brand: MantineColorsTuple = [
  "#f0fdfa",
  "#ccfbf1",
  "#99f6e4",
  "#5eead4",
  "#2dd4bf",
  "#14b8a6",
  "#0d9488",
  "#0f766e",
  "#115e59",
  "#134e4a",
];

const FONT_FAMILY =
  'var(--font-noto-sans-jp), "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", Meiryo, sans-serif';

export const theme = createTheme({
  colors: {
    brand,
    // 主色。ライト・ダークのどちらでも brand を使う「仮想の色」にしておくと、
    // ボタンの文字色（白か黒か）をモードごとの背景の明るさで決めてくれる。
    primary: virtualColor({ name: "primary", light: "brand", dark: "brand" }),
  },
  primaryColor: "primary",
  // ライトモードはブランドカラーそのもの（7番）。ダークモードの暗い背景では 7番だと沈んで読みにくいので、
  // 明るい 5番を使い、ボタンの文字は黒にする（autoContrast）。
  primaryShade: { light: 7, dark: 5 },
  autoContrast: true,
  // ボタン・入力欄・カード・モーダルなど、角の丸みはすべてこの値（4px）にそろえる。
  radius: { sm: "4px" },
  defaultRadius: "sm",
  fontFamily: FONT_FAMILY,
  headings: { fontFamily: FONT_FAMILY },
  cursorType: "pointer",
  components: {
    // 行の上下の余白を詰めて、1画面に多くの行を出す。
    Table: Table.extend({
      defaultProps: {
        verticalSpacing: 4,
        horizontalSpacing: "sm",
        fz: "sm",
        highlightOnHover: true,
        tabularNums: true,
      },
      // セルの中で折り返すと行が高くなるので、狭い画面では折り返さずに横にスクロールさせる
      styles: { th: { whiteSpace: "nowrap" }, td: { whiteSpace: "nowrap" } },
    }),
  },
});
