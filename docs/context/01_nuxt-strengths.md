# 01. Nuxt の強み(発表の主張ごとに整理)

発表の軸:**「モジュール(プラグイン)が豊富だから、テンプレートから足し算するだけで Web アプリが爆速で立ち上がる」**

目玉は主張B(モジュールエコシステム)。主張A(テンプレート)は「入口」、主張C・D は補足。

---

## 主張B0:モジュールの数と網羅範囲(★発表の目玉)

- 公式モジュール一覧 https://nuxt.com/modules に **数百規模** のモジュールが登録されている。表記は時期で変わり、273+ → 312+ → 435+ と増えている。312+ の時点では、Nuxt チームとコミュニティの約 2,000 人がメンテナンスしていると記載されていた。
  - **発表では「Nuxt 4 で実際に使えるモジュール」の数を使う**。2026-10-15 の集計では **277 件**(一覧の掲載は 433 件)。Nuxt 2 / 3 専用や更新の止まったものまで数えて多く見せることはしない。
  - 「使える」の条件: Nuxt 4 対応を宣言している、npm の最新版が deprecated でない、Nuxt 4.0.0 の公開(2025-07-15)以降に npm で更新されている。詳細は `results/modules/summary.md`(`pnpm modules` で再集計)。
  - **発表前に必ず当日の数を確認すること**。
- 種類は Official(Nuxt チーム)・Community(Nuxt の nuxt-modules organization でコミュニティが保守)・3rd-party(企業の公式モジュールと個人作者のモジュール)の 3 つ。Official と Community を合わせて「公式系」と呼ぶ。
  - 使える 277 件の内訳は、公式系 47 件(official 11 / community 36)、3rd-party 230 件。
- **入れ方は全部同じ**: `npx nuxi module add <name>` → `nuxt.config.ts` の `modules` に追記され、ビルドやランタイムへの組み込みまで自動で行われる。設定も `nuxt.config.ts` の 1 か所にまとまる。
- 一覧ページでは Shift+クリックで複数選択して、まとめてインストールできる。

### カテゴリ別の代表例(スライド用)
| カテゴリ | 代表モジュール |
| --- | --- |
| UI / アイコン | `@nuxt/ui`, `@nuxt/icon`(Iconify の 20 万以上のアイコン), Vuetify, PrimeVue |
| SEO | `@nuxtjs/seo`(sitemap / robots / OG 画像 / JSON-LD 一式) |
| 計測・スクリプト | `@nuxt/scripts`(GA, GTM, Pixel 等) |
| 画像・フォント | `@nuxt/image`, `@nuxt/fonts` |
| コンテンツ / CMS | `@nuxt/content`, 各 CMS(Storyblok, Contentful, Sanity 等) |
| 認証 | `nuxt-auth-utils`, Logto, Kinde, Supabase |
| i18n | `@nuxtjs/i18n` |
| 状態管理 | `@pinia/nuxt` |
| 品質・テスト | `@nuxt/eslint`, `@nuxt/test-utils`, `@nuxt/a11y`, `@nuxt/hints` |
| 開発体験 | `@nuxt/devtools`, Storybook |
| AI | `nuxt-llms`, `@nuxtjs/mcp-toolkit` |

### 数字で見せるネタ
- モジュールのメタデータは `@nuxt/modules` パッケージ(または https://github.com/nuxt/modules)で公開されている。カテゴリ別の件数を集計してグラフにすると、「なんでも揃う」を数字で見せられる。
- Next.js との違い:**Next にはこの統一されたモジュール機構と公式一覧がない**。同じことをするには npm パッケージをそれぞれのやり方で組み込む必要がある。ここが「プラグインが多い」だけでなく「**入れ方が統一されている**」という Nuxt の本当の強み。

---

## 主張A:テンプレートから立ち上げるのが爆速

### A-1. 公式テンプレートが豊富で、しかも無料
- Nuxt UI v4(2025-09)で、旧有料版の Nuxt UI Pro が統合され **完全無料・MIT** になった。125 以上のコンポーネントと Figma Kit も無料。
- 公式テンプレート: Dashboard / SaaS / Landing / Docs / Portfolio / Chat / Editor / Changelog / Starter。
- 立ち上げは 1 コマンド:
  ```bash
  npm create nuxt@latest -- -t ui                                   # Nuxt UI 入りスターター
  npm create nuxt@latest -- -t github:nuxt-ui-templates/dashboard   # ダッシュボード
  npm create nuxt@latest -- -t github:nuxt-ui-templates/saas        # LP+料金+ドキュメント+ブログ
  ```
- 背景: 2025-07 に Vercel が NuxtLabs を買収。Nuxt/Nitro は MIT・オープンガバナンスのまま、有料製品が無料化された。

### A-2. 自作テンプレートも GitHub に置くだけ
- 公式テンプレートと同じ仕組みで、自分の GitHub リポジトリをテンプレートにできる。
  ```bash
  npm create nuxt@latest my-app -- -t github:your-org/nuxt-starter
  ```
- テンプレートの中身は普通の Nuxt プロジェクトで、`nuxt.config.ts` の `modules` に必要なモジュールを並べておくだけ。
- 立ち上げ後は全コードが手元のリポジトリにあるので、普通に読んで直せる。
- **話の筋**: テンプレートの価値は「モジュールの組み合わせ」にある。モジュールが豊富だから、テンプレートが薄くても機能が揃う(→ 主張B につなぐ)。
- 補足: 継承型の Nuxt Layers(`extends`)もあるが、コードが別リポジトリに分かれて追いにくいため、この発表では扱わない(聞かれたら存在だけ紹介)。

### A-3. 規約(Convention over Configuration)
- ファイルベースルーティング(`pages/`)、レイアウト(`layouts/`)、ミドルウェア(`middleware/`)、サーバー API(`server/api/`)。
- **自動インポート**: コンポーネント・composable・`ref` / `computed` 等の import 文が不要。→ 書くコード量が減る。AI に書かせる場合も出力トークンが減る可能性(検証ポイント)。

---

## 主張B:SEO・スクリプトなど「Web アプリに要るもの」が 1 コマンドで揃う

### B-1. SEO
- コア標準: `useHead()` / `useSeoMeta()`(型付き)。
- `@nuxtjs/seo`(公式 SEO メタモジュール)を入れると以下が一括で入る:
  | モジュール | 役割 |
  | --- | --- |
  | `@nuxtjs/sitemap` | `pages/` から sitemap.xml を自動生成 |
  | `@nuxtjs/robots` | robots.txt 生成 |
  | `nuxt-og-image` | OG 画像を Vue コンポーネントで動的生成 |
  | `nuxt-schema-org` | JSON-LD 構造化データ |
  | `nuxt-seo-utils` | パンくず等のメタユーティリティ |
  | `nuxt-link-checker` | ビルド時リンクチェック |
  | `nuxt-site-config` | 上記で共有するサイト設定 |
- 導入: `npx nuxi module add @nuxtjs/seo`

### B-2. サードパーティスクリプト(`@nuxt/scripts`)
- GA / GTM / Meta Pixel / Clarity / YouTube / Google Maps など 20 以上の統合を型付き composable で提供(例: `useScriptGoogleAnalytics`)。
- 読み込みタイミング制御、同意管理(Consent)API、DevTools 連携。
- v1 で **First-Party Mode**: スクリプトを自ドメインにバンドル・プロキシし、ユーザーが外部サーバーへ直接通信しない(プライバシー向上)。
- 導入: `npx nuxi module add scripts`

### B-3. その他よく使う公式モジュール
`@nuxt/image`(画像最適化)、`@nuxt/fonts`(フォント最適化)、`@nuxt/content`(Markdown CMS)、`@nuxt/eslint`、`@nuxt/test-utils`、`nuxt-auth-utils`(認証)、`@nuxt/a11y`。
- **エコシステムの特徴**: 「モジュール」という統一された拡張の仕組みがあり、`nuxt.config.ts` の `modules` に足すだけで、ビルド/ランタイムのフックまで自動で配線される。Next.js にはこれに相当する公式のモジュール機構がない(後述)。

---

## 主張C:サーバー処理もそのまま書ける(Nitro)

### C-1. API
- `server/api/hello.ts` に `defineEventHandler` を書けば API エンドポイントになる。フロントと同じリポジトリ・同じ言語。

### C-2. 「バッチ処理は書けるのか?」への回答 → **書ける(Nitro Tasks)**
- `server/tasks/` に `defineTask` でタスクを定義し、`nitro.scheduledTasks` に cron 式で登録すると定期実行できる。
  ```ts
  // server/tasks/cleanup.ts
  export default defineTask({
    meta: { name: 'cleanup', description: '古いデータを削除' },
    async run() { /* ... */ return { result: 'ok' } }
  })
  // nuxt.config.ts
  export default defineNuxtConfig({
    nitro: {
      experimental: { tasks: true },
      scheduledTasks: { '0 3 * * *': ['cleanup'] }
    }
  })
  ```
- **注意点(発表で正直に言うべき)**:
  - Nuxt 4(Nitro 2)では **experimental フラグが必要**。Nitro 3(Nuxt 5 同梱)で安定化予定。
  - 定期実行はデプロイ先次第。Cloudflare は Cron Triggers と連携、Netlify は非対応、複数インスタンス構成では重複実行に注意。
  - 本格的なジョブキューが必要なら別サービスを使う、という線引きを示すと説得力が出る。
- 発表での言い方の例: 「ちょっとした定期処理(キャッシュ掃除、集計、通知)ならフロントと同じリポジトリで書ける」

### C-3. デプロイ先を選ばない
- Nitro のプリセットで Node / Vercel / Netlify / Cloudflare / AWS などにほぼ設定なしで対応。

---

## 主張D:AI 時代との相性

- **Nuxt 公式 MCP サーバー**(`https://nuxt.com/mcp`): Claude Code / Cursor / Windsurf などがドキュメント・ブログ・デプロイガイドを構造化データで参照できる。
  ```bash
  claude mcp add --transport http nuxt-remote https://nuxt.com/mcp
  ```
- Nuxt UI のドキュメントも MCP / llms.txt 対応。Nuxt Scripts も各ページに「Copy for LLMs」がある。
- 自分のサイトを AI 対応させる側のモジュールもある: `nuxt-llms`(llms.txt 自動生成)、`@nuxtjs/mcp-toolkit`(自分のアプリに MCP サーバーを生やす)。
- **ただし**: 学習データ量では React/Next.js が圧倒的に多く、LLM の素の生成精度は Next.js 有利という研究もある(`02` 参照)。「AI でも Nuxt は楽」は検証で確かめる対象として扱う。

---

## 直近の動向(2026-10 時点)

- Nuxt 4.4: `createUseFetch` / `createUseAsyncData` ファクトリ(プロジェクト共通のデフォルト設定を一元化)、Vue Router v5 がデフォルト、ルート遷移のアクセシビリティ通知、ビルドプロファイリング。
- Nuxt 4.5: 2026-07-18 リリース。チームは以降 v5 の安定化に注力。
- Nuxt 3: 2026-07-31 で EOL。
- リリース方針: メジャー年 1 回程度、マイナー毎月程度、パッチ毎週。
- Vercel が開発資金を提供しつつ、Nuxt/Nitro は MIT・公開ロードマップ・ベンダー非依存を維持すると表明。

## 発表で避けるべき言い方
- ✗「SEO もスクリプトも標準で全部入り」→ ○「公式モジュールを 1 コマンドで足すだけ」
- ✗「Next.js より速い/AI に強い」(根拠なし)→ ○「検証してみた結果」で語る
- ✗「バッチ処理もバッチリ」→ ○「軽い定期処理なら書ける(実験的機能・デプロイ先に依存)」
