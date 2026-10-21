// Nuxt UI のテーマ設定。ここに書いた内容が全画面の部品に効く。
// 色の値と角丸・書体は app/assets/main.css の @theme / :root で定義している。
export default defineAppConfig({
  ui: {
    colors: {
      // 会社のブランドカラー（#0F766E）。パレットは main.css の --color-brand-*
      primary: 'brand',
      neutral: 'slate',
    },
    // 押せないボタンをはっきり薄くする（初期値の 75% だと、打刻画面で押せるボタンと見分けにくい）
    button: {
      slots: {
        base: 'disabled:opacity-40 aria-disabled:opacity-40',
      },
    },
    // 一覧で1画面に多くの行を出せるよう、テーブルのセルの余白を詰める
    table: {
      slots: {
        th: 'px-3 py-2 whitespace-nowrap',
        td: 'px-3 py-1.5',
      },
    },
  },
})
