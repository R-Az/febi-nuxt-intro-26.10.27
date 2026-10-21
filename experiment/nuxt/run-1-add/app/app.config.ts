// Nuxt UI のテーマ設定。ここに書いた内容は全画面の部品に効く
export default defineAppConfig({
  ui: {
    colors: {
      // 主色は会社のブランドカラー。色の段階は app/assets/css/main.css の --color-brand-* で定義している
      primary: 'brand',
      neutral: 'slate',
    },
    table: {
      slots: {
        // 表の外枠と背景（全画面の表にそろえてつける）
        root: 'rounded-md border border-default bg-default',
        // 行の高さを詰めて、1画面に多くの行を表示する（既定は th: py-3.5、td: p-4）
        th: 'px-3 py-2',
        td: 'px-3 py-1.5 text-default',
      },
    },
  },
})
