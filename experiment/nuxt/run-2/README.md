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

## テストと型チェック

```bash
npm test            # 単体テスト（Vitest）
npm run typecheck   # 型チェック（vue-tsc）
npm run build       # 本番ビルド
```

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

## ディレクトリ構成

```
app/                 画面（pages, layouts, components, middleware）
server/api/          API
server/middleware/   API 全体の認証チェック
server/utils/        モックのデータ層（mock-db.ts, repository.ts）と業務ロジック
server/tasks/        定期処理
shared/              画面とサーバーで共有する型・計算ロジック・日付処理
tests/               単体テスト
```
