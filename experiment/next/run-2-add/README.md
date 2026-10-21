# 勤怠管理

従業員10〜30人程度の会社向けの勤怠管理 Web アプリです。Next.js 16（App Router）と TypeScript で作っています。画面の部品には UI コンポーネントライブラリの [Mantine](https://mantine.dev/) を使っています。データベースは使わず、サーバーのメモリ上にモックのデータを持ちます。サーバーを再起動すると初期データに戻ります。

## 必要なもの

- Node.js 20.9 以上（Node.js 24 で動作を確認しています）
- npm

## 起動方法

```bash
npm install
```

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開くと、ログイン画面が表示されます。

本番ビルドで起動する場合は、次の2つを順に実行します。

```bash
npm run build
```

```bash
npm run start
```

本番で使う場合は、セッションの署名に使う秘密鍵を環境変数 `SESSION_SECRET` に設定してください。設定しないと、開発用の固定値が使われます。

## テストの実行方法

```bash
npm test
```

Vitest で単体テストを実行します。テストは `tests/` にあります。

| ファイル | 内容 |
| --- | --- |
| `tests/calc.test.ts` | 勤怠の計算ルール（実働・残業・打刻漏れ・月の合計） |
| `tests/punch.test.ts` | 打刻の状態遷移（押せない打刻を弾く） |
| `tests/validate.test.ts` | 管理者による修正の入力チェック |
| `tests/csv.test.ts` | CSV の形式（BOM、列順、打刻漏れの扱い） |
| `tests/time.test.ts` | 日本時間の日付・時刻の扱い |
| `tests/scheduler.test.ts` | 毎日0時の打刻漏れ検出 |
| `tests/analytics.test.ts` | アクセス解析の同意と、打刻イベントの送信 |

型チェックは次のコマンドで実行します。

```bash
npm run typecheck
```

## Lint の実行方法

ESLint で、コードの書き方の誤りや React・Next.js の使い方の問題を検出します。設定は `eslint.config.mjs` にあり、Next.js 公式の設定（`eslint-config-next` の `core-web-vitals` と `typescript`）を使っています。

```bash
npm run lint
```

エラーと警告がなければ、何も表示されずに終わります。自動で直せるものを直すときは `npx eslint --fix` を実行します。

## ログイン用のアカウント

| 役割 | 従業員ID | 氏名 | メールアドレス | パスワード |
| --- | --- | --- | --- | --- |
| 管理者 | A001 | 佐藤 花子 | admin@example.com | admin1234 |
| 従業員 | E001 | 鈴木 一郎 | suzuki@example.com | password1234 |
| 従業員 | E002 | 高橋 美咲 | takahashi@example.com | password1234 |
| 従業員 | E003 | 田中 健太 | tanaka@example.com | password1234 |
| 従業員 | E004 | 伊藤 さくら | ito@example.com | password1234 |

従業員4人には、先月1日から昨日までの平日の勤怠が入っています。今日の分は打刻を試せるように空けてあります。このうち2件は「出勤だけ打刻して退勤がない日」です（高橋さんの直近の平日と、伊藤さんの3つ前の平日）。

## 画面

| 画面 | パス | 使える人 |
| --- | --- | --- |
| ログイン | `/login` | 全員 |
| 打刻 | `/punch` | 従業員 |
| 自分の勤怠一覧 | `/attendance` | 従業員 |
| 月次一覧 | `/admin` | 管理者 |
| 勤怠修正 | `/admin/attendance` | 管理者 |
| CSV出力 | `/admin/export` | 管理者 |
| 打刻漏れ検出 | `/admin/missing-punches` | 管理者 |

ログインしていない状態でログイン画面以外を開くと、ログイン画面に移ります。役割に合わない画面を開いた場合は、それぞれのトップ画面（従業員は打刻、管理者は月次一覧）に移ります。

## 画面の見た目

ボタン、入力欄、表、モーダルなどの部品は Mantine のものを使っています。色や角の丸みは部品ごとには指定せず、`lib/theme.ts` のテーマ設定で全画面にまとめて効かせています。

| 項目 | 設定 |
| --- | --- |
| 主色（ボタン、リンク、選択中のメニュー） | ブランドカラー #0F766E。ダークモードでは明るい #14B8A6 を使い、ボタンの文字を黒にして読みやすくしています |
| ボタン・入力欄の角の丸み | 4px（カードやモーダルも同じ値） |
| 本文の書体 | Noto Sans JP（`next/font` でアプリと同じサーバーから配信） |
| 表の行の高さ | 上下の余白を 4px に詰めています。狭い画面では折り返さずに横にスクロールします |

ライトモードとダークモードは、画面右上（ログイン画面ではタイトルの右）の太陽・月のボタンで切り替えます。最初は OS の設定に合わせて表示し、切り替えた結果はブラウザに保存します。

## アクセス解析（Google Analytics）

Google Analytics（測定ID：`G-XXXXXXXXXX`）で利用状況を計測します。測定IDは環境変数 `NEXT_PUBLIC_GA_MEASUREMENT_ID` で差し替えられます。

- 初めて開いたときは、画面の下に同意のバナーが出ます。「同意する」を押すまでは、Google のスクリプト（gtag.js）を読み込まず、計測のデータも送りません。
- 「同意する」を押すと gtag.js を読み込み、計測を始めます。読み込みは画面の表示が終わったあとに行う（`next/script` の `afterInteractive`）ので、最初の画面の表示を待たせません。
- 「同意しない」を選んだ場合は、計測しません。どちらを選んだかはブラウザに保存し、次回からはバナーを出しません。
- 同意すると Consent Mode の初期値として、計測（`analytics_storage`）を許可し、広告用の項目（`ad_storage` など）は拒否にします。
- 打刻に成功すると、イベント `punch` を送ります。パラメータは `punch_type`（`clock_in` / `break_start` / `break_end` / `clock_out`）と `punch_label`（出勤・休憩開始・休憩終了・退勤）です。

選んだ内容をやり直すときは、ブラウザの開発者ツールで localStorage の `analytics-consent` を削除してください。

## 勤怠の計算ルール

- 実働時間 = 退勤 − 出勤 − 休憩時間
- 残業時間 = 実働時間 − 8時間（マイナスなら0）
- 退勤がない過去の日は、実働・残業を計算せず「打刻漏れ」と表示します。今日の未退勤は「勤務中」と表示し、打刻漏れには数えません。
- 月の実働・残業の合計に、打刻漏れの日は含めません。出勤日数には含めます。

時刻はすべて日本時間（Asia/Tokyo）で、分単位で扱います。打刻の時刻にはサーバーの現在時刻を使います。

## API

画面からのデータの読み書きは、すべて次の API を通します。ログインしていなければ 401、権限がなければ 403 を返します。

| メソッド | パス | 内容 | 権限 |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | ログイン | なし |
| POST | `/api/auth/logout` | ログアウト | なし |
| GET | `/api/auth/me` | ログイン中のユーザーと今日の日付 | ログイン |
| GET | `/api/users/:userId/today` | 今日の打刻状態 | 本人・管理者 |
| POST | `/api/users/:userId/punches` | 打刻 | 本人（従業員） |
| GET | `/api/users/:userId/attendance?month=YYYY-MM` | 月の勤怠一覧 | 本人・管理者 |
| GET | `/api/admin/employees` | 従業員の一覧 | 管理者 |
| GET | `/api/admin/monthly-summary?month=YYYY-MM` | 全従業員の月次集計 | 管理者 |
| PUT | `/api/admin/attendance/:userId/:date` | 勤怠の修正 | 管理者 |
| GET | `/api/admin/export?month=YYYY-MM&userId=all` | CSV 出力 | 管理者 |
| GET / POST | `/api/admin/missing-punches` | 打刻漏れの検出結果の取得、手動実行 | 管理者 |
| GET | `/api/cron/missing-punches` | 外部スケジューラからの検出の起動 | `CRON_SECRET` |

## 打刻漏れの定期検出

`instrumentation.ts` がサーバー起動時にスケジューラを動かし、毎日0時（日本時間）に前日の「出勤があって退勤がない」記録を検出して記録します。データがサーバーのメモリ上にあるので、外部のサービスではなく同じプロセスの中のタイマーで実行しています。結果は管理者の「打刻漏れ検出」画面で確認できます。

サーバーが0時に止まっていた場合に備えて、起動時にも前日分を検出します。指定した日の検出を画面から手動で実行することもできます。

OS の cron などの外部スケジューラから起動したい場合は、環境変数 `CRON_SECRET` を設定し、`Authorization: Bearer <CRON_SECRET>` を付けて `GET /api/cron/missing-punches` を呼びます。

## ディレクトリ構成

```
app/
  (app)/          ログイン後の画面（共通ヘッダー付き）
  api/            API のルートハンドラ
  login/          ログイン画面
  layout.tsx      全画面の土台（書体、テーマ、ライト／ダークの初期化）
components/       画面の部品（providers.tsx がテーマとアクセス解析を全画面に組み込む）
lib/
  theme.ts        UI のテーマ設定（主色、角の丸み、書体、表の行の高さ）
  attendance/     計算ルール・打刻の状態遷移・入力チェック・CSV（画面とサーバーで共有）
  server/         モックのデータ層、認証、勤怠の処理、定期処理（サーバー専用）
  client/         画面から API を呼ぶ処理、アクセス解析の同意とイベント送信
  session.ts      署名付き Cookie のセッション
  time.ts         日本時間の日付・時刻のユーティリティ
proxy.ts          画面へのアクセス制御
instrumentation.ts  定期処理の起動
tests/            単体テスト
```
