# 勤怠管理

従業員10〜30人程度の会社向けの勤怠管理Webアプリです。Nuxt 4（TypeScript）で作っています。
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

## テスト・型チェック

```bash
npm test           # 単体テスト（Vitest）
npm run typecheck  # 型チェック（vue-tsc）
npm run build      # ビルド
```

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
app/          画面（pages, components, layouts, middleware）
server/api/   API
server/utils/ モックのデータ層（store.ts）、初期データ（seed.ts）、権限チェック、CSV
server/tasks/ 定期処理
shared/       画面とサーバーで共有する型・計算ロジック
test/unit/    単体テスト
```
