# 勤怠管理アプリ

従業員10〜30人程度の会社向けの勤怠管理 Web アプリです。Nuxt 4（TypeScript）で作っています。データベースは使わず、サーバー側のメモリにモックのデータを持ちます。サーバーを再起動すると初期データに戻ります。

## 必要な環境

- Node.js 22.22.3 以上または 24.15.0 以上（Nuxt 4.6 の要件。動作確認は v24.21.0 で行いました）
- npm

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開くと、ログイン画面が表示されます。

`npm run dev` を初めて実行すると、セッション Cookie の暗号化キー `NUXT_SESSION_PASSWORD` が `.env` に自動で書き込まれます（nuxt-auth-utils の機能）。

### 本番ビルドで動かす場合

```bash
npm run build
NUXT_SESSION_PASSWORD=32文字以上のランダムな文字列 node .output/server/index.mjs
```

本番ビルドでは `.env` が自動生成されないので、`NUXT_SESSION_PASSWORD` を必ず設定してください。

## テスト・型チェック・Lint

```bash
npm test            # 単体テスト（Vitest）
npm run typecheck   # 型チェック（vue-tsc）
npm run lint        # Lint（ESLint）
npm run lint:fix    # Lint で自動修正できるものを直す
npm run build       # 本番ビルド
```

Lint は Nuxt 公式の `@nuxt/eslint` モジュールで設定しています。ルールは Nuxt の推奨設定に、書き方のルール（`stylistic`：セミコロンなし、シングルクォート、2スペース）を加えたものです。設定は `nuxt.config.ts` の `eslint` と `eslint.config.mjs` にあります。`eslint.config.mjs` は `.nuxt/eslint.config.mjs` を読み込むので、`npm install`（`nuxt prepare`）を済ませてから実行してください。

単体テストは `tests/` にあります。勤怠の計算ルール（実働・残業・打刻漏れ・月の合計）、打刻の状態遷移、管理者の修正内容の検査、日本時間の日付計算を確かめています。

## ログイン用のアカウント

| 役割 | 従業員ID | 氏名 | メールアドレス | パスワード |
| --- | --- | --- | --- | --- |
| 管理者 | A001 | 管理 花子 | admin@example.com | admin1234 |
| 従業員 | E001 | 佐藤 健 | sato@example.com | sato1234 |
| 従業員 | E002 | 鈴木 美咲 | suzuki@example.com | suzuki1234 |
| 従業員 | E003 | 高橋 翔 | takahashi@example.com | takahashi1234 |
| 従業員 | E004 | 田中 由紀 | tanaka@example.com | tanaka1234 |

初期データには、従業員4人の先月1日から昨日までの平日（祝日は考慮しません）の勤怠が入っています。日付はサーバーを起動した日を基準に作ります。このうち次の2件は、出勤だけ打刻して退勤がない日です。

- E002 鈴木 美咲：先月の5営業日目
- E004 田中 由紀：今月の平日のうち、昨日から数えて3日前（今月に平日がなければ先月の終わり頃）

## 画面

| パス | 対象 | 内容 |
| --- | --- | --- |
| `/login` | 全員 | ログイン |
| `/punch` | 従業員 | 出勤・休憩開始・休憩終了・退勤の打刻。今の状態で押せないボタンは押せません |
| `/attendance` | 従業員 | 自分の月別勤怠一覧と月の合計 |
| `/admin` | 管理者 | 全従業員の月次集計（出勤日数・実働・残業・打刻漏れ件数） |
| `/admin/employees/:id` | 管理者 | 従業員の日別勤怠と修正 |
| `/admin/missing-punches` | 管理者 | 定期処理が検出した打刻漏れの一覧 |
| `/admin/export` | 管理者 | 勤怠の CSV ダウンロード |

ログインしていないと、どの画面を開いてもログイン画面に移ります。従業員が管理者用の画面を開くと打刻画面に、管理者が従業員用の画面を開くと月次一覧に移ります。

## 勤怠の計算ルール

- 実働時間 = 退勤 − 出勤 − 休憩時間
- 残業時間 = 実働時間 − 8時間（マイナスなら0）
- 退勤がない日は実働・残業を計算せず、「打刻漏れ」と表示します。ただし今日の分は勤務中なので「勤務中」と表示し、打刻漏れには数えません。
- 出勤日数には打刻漏れの日も含めます。実働・残業の合計には含めません。

計算は `shared/utils/attendance.ts` にまとめ、画面とサーバーの両方から使っています。

## API

画面からのデータの読み書きは、すべて `server/api` の API を通します。ログインしていないと 401、権限がないと 403 を返します。

| メソッド・パス | 権限 | 内容 |
| --- | --- | --- |
| `POST /api/auth/login` | 誰でも | ログイン |
| `DELETE /api/_auth/session` | 誰でも | ログアウト（nuxt-auth-utils） |
| `GET /api/punch/status` | 従業員 | 今日の打刻状態 |
| `POST /api/punch` | 従業員 | 打刻。押せない打刻は 409 |
| `GET /api/users/:userId/attendance?month=YYYY-MM` | 本人か管理者 | 月別勤怠。他人の分は 403 |
| `GET /api/admin/employees` | 管理者 | 従業員一覧 |
| `GET /api/admin/summary?month=YYYY-MM` | 管理者 | 月次集計 |
| `PUT /api/admin/attendance/:userId/:date` | 管理者 | 勤怠の修正。不正な内容は 400 とエラー内容 |
| `GET /api/admin/export?month=YYYY-MM&userId=all\|E001` | 管理者 | CSV |
| `GET /api/admin/missing-punches` | 管理者 | 検出した打刻漏れ |
| `POST /api/admin/missing-punches/run` | 管理者 | 打刻漏れ検出を今すぐ実行（動作確認用） |

## 打刻漏れの定期検出

Nitro の Scheduled Tasks で、毎日 0:00（日本時間）に `attendance:detect-missing` を実行します。前日に出勤したまま退勤がない記録を探し、打刻漏れとして記録します。同じ人・同じ日は二重に記録しません。

- タスク本体：`server/tasks/attendance/detect-missing.ts`
- スケジュール：`nuxt.config.ts` の `nitro.scheduledTasks`

Nitro のスケジューラはサーバーのローカル時刻で動きます。サーバーのタイムゾーンが UTC でも日本時間の 0 時に動くように、`server/plugins/timezone.ts` で `TZ` を `Asia/Tokyo` に固定しています。

この仕組みは、Node.js サーバーとして常に動かす場合（`npm run dev`、`node .output/server/index.mjs`）に動きます。サーバーレス環境に置くときは、デプロイ先のスケジューラ（Cloudflare Cron Triggers など）から同じタスクを呼ぶ設定が別に必要です。

## 画面の見た目（Nuxt UI）

画面の部品（ボタン、入力欄、テーブル、モーダルなど）には、Nuxt 公式の UI ライブラリ [Nuxt UI](https://ui.nuxt.com) を使っています。ヘッダー右上（ログイン画面では右上）のボタンで、ライトモードとダークモードを切り替えられます。最初は OS の設定に合わせて表示し、切り替えた結果はブラウザに保存します。

見た目の調整は、部品ごとではなく次の2つのファイルでまとめて設定しています。

| 設定 | 内容 | 場所 |
| --- | --- | --- |
| 主色 | 会社のブランドカラー #0F766E。ダークモードでは、暗い背景で読みやすい明るい色（#2DD4BF）に切り替える | `app/assets/main.css` の `--color-brand-*` と、`app/app.config.ts` の `ui.colors.primary` |
| 角丸 | ボタンと入力欄の角丸を 4px にそろえる | `app/assets/main.css` の `--ui-radius` |
| 書体 | 本文を Noto Sans JP にする。フォントはビルド時に取得し、アプリのサーバーから配信する | `app/assets/main.css` の `--font-sans` |
| テーブル | セルの上下の余白を詰めて、1画面に多くの行を表示する | `app/app.config.ts` の `ui.table` |
| 押せないボタン | 押せないボタンを薄く表示して、押せるボタンと見分けやすくする | `app/app.config.ts` の `ui.button` |

アイコンは Lucide（`@iconify-json/lucide`）を使い、アプリに同梱しています。

## アクセス解析（Google Analytics）

Google Analytics（測定ID：`G-XXXXXXXXXX`）で利用状況を計測します。読み込みには `nuxt-gtag` モジュールを使っています。

- 初めて開いたときは、画面の下に同意を求めるバナーを出します。「同意する」を押すまで、Google Analytics のスクリプト（gtag.js）を読み込まず、計測も送りません。
- 「同意する」を押すと、その場で gtag.js を読み込み、計測を始めます。「同意しない」を押した場合は何も送りません。どちらを選んだかは Cookie `analytics_consent` に1年間保存し、次からはバナーを出しません。
- 同意済みの人が画面を開いたときは、最初の画面の表示が終わり、ブラウザの手が空いてから gtag.js を読み込みます（`app/plugins/analytics.client.ts`）。
- 打刻すると、イベント `punch` を送ります。パラメータ `punch_type` に種類（`clock_in` 出勤、`break_start` 休憩開始、`break_end` 休憩終了、`clock_out` 退勤）を、`punch_label` に日本語の名前を入れます。
- 画面の移動による page_view は、GA4 の拡張計測機能（ブラウザの履歴イベントによるページ変更）で記録します。GA4 の管理画面でこの設定を有効にしてください。

同意の状態と送信の処理は `app/composables/useAnalytics.ts`、バナーは `app/components/AnalyticsConsentBanner.vue` にあります。同意を取り消したいときは、ブラウザで Cookie `analytics_consent` を削除してください（画面からの取り消しはまだできません）。

## ディレクトリ構成

```
app/                 画面（pages, layouts, components, composables, plugins, middleware）とテーマ設定（app.config.ts）
server/api/          API
server/middleware/   API 全体の認証チェック
server/utils/        モックのデータ層（mock-db.ts, repository.ts）と業務ロジック
server/tasks/        定期処理
shared/              画面とサーバーで共有する型・計算ロジック・日付処理
tests/               単体テスト
```
