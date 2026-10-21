# 勤怠管理

従業員10〜30人程度の会社向けの勤怠管理Webアプリです。Nuxt 4（TypeScript）で作っています。画面の部品には Nuxt UI を使っています。
データベースは使わず、サーバー側のメモリにデータを持ちます。サーバーを再起動すると初期データに戻ります。

## 必要なもの

- Node.js 22.22.3 以上、24.15.0 以上、または 26 以上（Nuxt 4.6 の要件。動作確認は 24.21.0）
- npm

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開くと、ログイン画面が表示されます。

初回の `npm run dev` では、セッション用の暗号化キー `NUXT_SESSION_PASSWORD` が `.env` に自動で書き込まれます。

### 本番ビルドで動かす

```bash
npm run build
NUXT_SESSION_PASSWORD=<32文字以上のランダムな文字列> node .output/server/index.mjs
```

開発サーバーで作られた `.env` をそのまま使う場合は `node --env-file=.env .output/server/index.mjs` でも起動できます。

## Lint・テスト・型チェック

```bash
npm run lint       # Lint（ESLint）
npm run lint:fix   # Lint で見つかった書き方の違反のうち、自動で直せるものを直す
npm test           # 単体テスト（Vitest）
npm run typecheck  # 型チェック（vue-tsc）
npm run build      # ビルド
```

Lint の設定は `eslint.config.mjs` です。Nuxt 公式の `@nuxt/eslint` を使い、Vue・TypeScript の推奨ルールに加えて書き方のルール（セミコロンなし、シングルクォート、2スペース）も確かめます。
`npm run lint` が初回に読み込む `.nuxt/eslint.config.mjs` は `npm install`（`nuxt prepare`）で作られます。

単体テストは `test/unit/` にあります。勤怠の計算ルール、打刻の状態遷移、管理者の修正内容のチェック、CSVの形式を確かめています。

## ログイン用のアカウント

| 役割 | ID | 氏名 | メールアドレス | パスワード |
| --- | --- | --- | --- | --- |
| 管理者 | A001 | 山本 管理 | admin@example.com | admin1234 |
| 従業員 | E001 | 鈴木 一郎 | suzuki@example.com | suzuki1234 |
| 従業員 | E002 | 高橋 美咲 | takahashi@example.com | takahashi1234 |
| 従業員 | E003 | 田中 健太 | tanaka@example.com | tanaka1234 |
| 従業員 | E004 | 伊藤 さくら | ito@example.com | ito1234 |

初期データとして、従業員4人に先月1日から昨日までの平日の勤怠が入っています。今日の分は空なので、ログインしてすぐ打刻を試せます。
次の2件は退勤の打刻がない「打刻漏れ」です（日付は起動した日によって変わります）。

- 高橋 美咲：先月の平日のうちの1日
- 田中 健太：昨日以前で直近の平日

## 画面

| URL | 利用者 | 内容 |
| --- | --- | --- |
| `/login` | 全員 | ログイン |
| `/` | 従業員 | 打刻（出勤・休憩開始・休憩終了・退勤） |
| `/attendance` | 従業員 | 自分の月別の勤怠一覧と合計 |
| `/admin` | 管理者 | 全従業員の月次一覧 |
| `/admin/users/:id` | 管理者 | 従業員の日別の勤怠と修正 |
| `/admin/missing` | 管理者 | 検出した打刻漏れと検出処理の実行履歴 |
| `/admin/export` | 管理者 | CSV出力 |

## 画面の見た目

画面の部品（ボタン、入力欄、テーブル、モーダルなど）は [Nuxt UI](https://ui.nuxt.com/) で作っています。
ヘッダーとログイン画面右上のボタンで、ライトモードとダークモードを切り替えられます。初めて開いたときは OS の設定に合わせます。

見た目の調整は部品ごとには書かず、次の2つのファイルにまとめています。ここを変えると全画面に反映されます。

| ファイル | 内容 |
| --- | --- |
| `app/app.config.ts` | 主色にブランドカラーの色の段階を割り当てる。テーブルの行の高さを詰める（セルの上下の余白を小さくする） |
| `app/assets/css/main.css` | ブランドカラー #0F766E を中心にした色の段階、本文の書体（Noto Sans JP）、角の丸み（ボタンと入力欄が 4px）、ライト・ダークそれぞれの主色の明るさ |

主色はライトモードでは #0F766E そのもので、ダークモードでは暗い背景でも読めるよう明るい #2DD4BF にしています。
書体の Noto Sans JP は、ビルド時（開発サーバーでは初回表示時）に Google Fonts から取得して、このアプリから配信します。そのため、初回のビルドにはインターネット接続が必要です。

## アクセス解析（Google Analytics）

Google Analytics（測定ID：`G-XXXXXXXXXX`）で、画面の利用状況を計測します。読み込みには Nuxt 公式の `@nuxt/scripts` を使っています。

- 初めて開くと、画面の下に同意のバナーが出ます。「同意する」を押すまでは、Google のスクリプト（gtag.js）を読み込まず、計測データも送りません。
- 同意すると、その場で gtag.js を非同期で読み込み、計測を始めます。次に開いたときは、画面の表示が終わってから読み込むので、最初の表示を遅らせません。
- 選んだ結果は Cookie（`analytics_consent`）に1年間保存します。画面下の「アクセス解析の設定」を押すと、バナーをもう一度出して選び直せます。同意を取り消すと、その時点で送信を止めます。
- 打刻に成功すると、イベント `punch` を送ります。パラメーターは `punch_type`（`clock_in`／`break_start`／`break_end`／`clock_out`）と `punch_label`（出勤／休憩開始／休憩終了／退勤）です。同意する前の打刻は送りません。

測定ID は `nuxt.config.ts` の `scripts.registry.googleAnalytics.id` にあります。本番では環境変数 `NUXT_PUBLIC_SCRIPTS_GOOGLE_ANALYTICS_ID` で上書きできます。
仕組みは `app/plugins/analytics.client.ts`（読み込みと送信）、`app/composables/useAnalytics.ts`（同意の状態）、`app/components/AnalyticsConsentBanner.vue`（バナー）に分けています。

## 勤怠の計算ルール

- 実働時間 = 退勤 − 出勤 − 休憩時間
- 残業時間 = 実働時間 − 8時間（マイナスなら0）
- 退勤がない日は実働・残業を計算せず「打刻漏れ」と表示します。今日の分でまだ退勤していない場合だけは「勤務中」と表示します。
- 出勤日数には打刻漏れの日も含めます。実働・残業の合計には含めません。

計算は `shared/utils/attendance.ts` にまとめていて、画面とサーバーの両方から同じ関数を使います。

## 打刻漏れの定期検出

毎日0時（日本時間）に、前日の打刻漏れを検出して記録します。Nitro の Scheduled Tasks を使っています。

- タスク本体：`server/tasks/attendance/detect-missing.ts`
- スケジュール：`nuxt.config.ts` の `nitro.scheduledTasks`（`'0 0 * * *'`）

Nitro の cron はサーバープロセスのローカル時刻で動きます。そのため `server/plugins/timezone.ts` で、スケジューラーが起動する前に `TZ=Asia/Tokyo` に固定しています。
管理者の「打刻漏れ」画面から、対象日を選んで手動で実行することもできます。

この仕組みが動くのは、Node.js サーバーとして常駐させる場合です（`npm run dev`、`node .output/server/index.mjs`）。
サーバーレス環境では、デプロイ先の cron 機能で `0 0 * * *` を呼ぶ設定が別に必要です。たとえば Cloudflare Workers の Cron Triggers は UTC 基準なので `0 15 * * *` にします。

## API

画面からのデータの読み書きは、すべて `/api` を通します。ログイン以外の API は、未ログインなら 401 を返します。
`/api/admin/**` は管理者以外には 403 を返します。従業員が他人の勤怠を読もうとした場合も 403 です。

| メソッド | パス | 権限 | 内容 |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | なし | ログイン |
| POST | `/api/auth/logout` | ログイン | ログアウト |
| GET | `/api/attendance/today` | 従業員 | 自分の今日の打刻状況 |
| POST | `/api/attendance/punch` | 従業員 | 打刻（`{ action: 'clock_in' \| 'break_start' \| 'break_end' \| 'clock_out' }`） |
| GET | `/api/users/:userId/attendance?month=YYYY-MM` | 本人・管理者 | 月別の勤怠 |
| GET | `/api/admin/users` | 管理者 | 従業員の一覧 |
| GET | `/api/admin/summary?month=YYYY-MM` | 管理者 | 全従業員の月次集計 |
| PUT | `/api/admin/attendance/:userId/:date` | 管理者 | 勤怠の修正・登録 |
| DELETE | `/api/admin/attendance/:userId/:date` | 管理者 | 勤怠の削除 |
| GET | `/api/admin/export?month=YYYY-MM&userId=all` | 管理者 | CSV（UTF-8 BOM付き） |
| GET | `/api/admin/missing-punches` | 管理者 | 検出した打刻漏れと実行履歴 |
| POST | `/api/admin/missing-punches/run` | 管理者 | 打刻漏れ検出の手動実行（`{ date: 'YYYY-MM-DD' }`） |

## ディレクトリ構成

```
app/          画面（pages, components, layouts, middleware, plugins）。app.config.ts は Nuxt UI のテーマ設定
server/api/   API
server/utils/ モックのデータ層（store.ts）、初期データ（seed.ts）、権限チェック、CSV
server/tasks/ 定期処理
shared/       画面とサーバーで共有する型・計算ロジック
test/unit/    単体テスト
```
