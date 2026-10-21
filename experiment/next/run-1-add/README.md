# 勤怠管理

従業員 10〜30 人程度の会社向けの勤怠管理 Web アプリです。Next.js 16（App Router）と TypeScript で作っています。画面の部品には Mantine を使っています。

データベースは使わず、サーバーのメモリ上にモックのデータを持ちます。サーバーを再起動すると初期データに戻ります。画面はすべてサーバーの API（`app/api/**`）を通してデータを読み書きします。

## 必要なもの

- Node.js 22.12 以上（動作確認は 24.21.0）
- npm

## 起動方法

```bash
npm install
```

開発サーバー（http://localhost:3000）:

```bash
npm run dev
```

本番ビルドと起動:

```bash
npm run build
```

```bash
npm start
```

環境変数は `.env.example` を参考に `.env.local` へ書きます。どちらも未設定のままで動きます。

| 変数 | 用途 |
| --- | --- |
| `SESSION_SECRET` | セッション Cookie の署名鍵。未設定なら開発用の固定値を使うので、本番では必ず設定してください。 |
| `CRON_SECRET` | 外部スケジューラから打刻漏れ検出 API を呼ぶときの合言葉。 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics の測定 ID。未設定なら `G-XXXXXXXXXX` を使います。ビルド時に埋め込まれるので、変えたらビルドし直してください。 |

## テスト・型チェック・Lint

```bash
npm test
```

```bash
npm run typecheck
```

```bash
npm run lint
```

Lint は ESLint 9 と Next.js 公式の設定（`eslint-config-next` の core-web-vitals と TypeScript 用のルール）で、設定は `eslint.config.mjs` にあります。`npm run lint` はプロジェクト全体を調べ、エラーが 1 件でもあれば失敗します。自動で直せるものを直すときは次のコマンドを使います。

```bash
npm run lint:fix
```

テストは Vitest で、`tests/` にあります。勤怠の計算ルール（`lib/attendance.ts`）のほか、打刻の状態遷移、修正時の入力チェック、CSV の形式、打刻漏れの検出、アクセス解析の同意と打刻イベントの送信も確かめています。

## ログイン用のアカウント

| 役割 | 従業員ID | 氏名 | メールアドレス | パスワード |
| --- | --- | --- | --- | --- |
| 管理者 | A001 | 佐藤 恵子 | admin@example.com | admin1234 |
| 従業員 | E001 | 鈴木 一郎 | suzuki@example.com | password1 |
| 従業員 | E002 | 高橋 花子 | takahashi@example.com | password2 |
| 従業員 | E003 | 田中 健太 | tanaka@example.com | password3 |
| 従業員 | E004 | 伊藤 美咲 | ito@example.com | password4 |

従業員 4 人には、先月と今月の平日のうち今日より前の日の勤怠が入っています。今日の分は空けてあるので、打刻をそのまま試せます。打刻漏れ（出勤だけで退勤がない日）は、E002 の先月 3 番目の平日と、E004 の直近の平日の 2 件です。

## 画面

| URL | 対象 | 内容 |
| --- | --- | --- |
| `/login` | 全員 | ログイン |
| `/punch` | 従業員 | 出勤・休憩開始・休憩終了・退勤の打刻 |
| `/attendance` | 従業員 | 自分の勤怠一覧（月ごと、合計つき） |
| `/admin` | 管理者 | 全従業員の月次一覧 |
| `/admin/attendance` | 管理者 | 従業員ごとの日別一覧と、勤怠の修正 |
| `/admin/missing` | 管理者 | 打刻漏れの検出記録と、手動での検出 |
| `/admin/export` | 管理者 | 勤怠の CSV 出力 |

ログインしていないと、どの画面を開いてもログイン画面に移ります（`proxy.ts`）。従業員が管理者用の画面を開くと打刻画面に、管理者が従業員用の画面を開くと月次一覧に移ります。

## 画面の見た目

画面は UI コンポーネントライブラリの [Mantine](https://mantine.dev/)（v9）で作っています。ボタン、入力欄、表、モーダル、日付の選択などは Mantine の部品です。

見た目はテーマ設定（`components/theme.ts`）でまとめて決めていて、部品ごとに色や角の丸みを指定していません。変えたいときはこのファイルを直します。

| 項目 | 設定 |
| --- | --- |
| 主色（ボタン、リンク、選択中のメニューなど） | 会社のブランドカラー `#0F766E`。ダークモードでは暗い背景で読めるよう、同じ色相の明るい色（`#14B8A6`、文字は黒）に切り替えます。 |
| 角の丸み | ボタン、入力欄、カードなどを 4px にそろえています。 |
| 書体 | Noto Sans JP（`next/font` でサーバーから配信するので、閲覧時に Google のサーバーへはアクセスしません）。 |
| 表 | 行の上下の余白を 4px に詰め、文字を 14px にしています。 |

画面右上のボタンで、ライトモードとダークモードを切り替えられます。最初は OS の設定に合わせ、選んだモードはブラウザに保存します。

## アクセス解析（Google Analytics）

Google Analytics（測定 ID：`G-XXXXXXXXXX`）で利用状況を計測します。

- 初めて開いたときは、画面の下に同意を求めるバナーが出ます。「同意する」を押すまで、計測用のスクリプト（gtag.js）を読み込まず、データも送りません。「同意しない」を選んだ場合も送りません。
- 同意すると、その場で gtag.js を読み込んで計測を始めます。読み込みは画面の表示が終わってから行うので、最初の画面の表示を遅らせません。
- 選んだ結果はブラウザ（localStorage の `analytics-consent`）に保存します。選び直したいときは、この値を消してから画面を開き直してください。
- 打刻すると、イベント `punch` を送ります。パラメータ `punch_type` に種類（出勤・休憩開始・休憩終了・退勤）、`punch_action` に内部の値（`clock_in` など）が入ります。
- 同意を得たのはアクセス解析だけなので、広告用の保存と利用（`ad_storage` など）は拒否のまま送ります。

処理は `lib/analytics.ts`（同意の保存と送信）と `components/Analytics.tsx`（バナーと読み込み）にあります。

## 勤怠の計算ルール

- 実働時間 = 退勤 − 出勤 − 休憩時間
- 残業時間 = 実働時間 − 8 時間（マイナスなら 0）
- 退勤がない日は実働・残業を計算しません。過去の日は「打刻漏れ」、今日の分は「勤務中」と表示します。
- 時刻は日本時間（Asia/Tokyo）の分単位で扱います。月の合計には、打刻漏れの日の実働・残業を含めません。

## API

画面が使う API です。ログインしていなければ 401、権限がなければ 403 を返します。

| メソッドとパス | 権限 | 内容 |
| --- | --- | --- |
| `POST /api/auth/login` | なし | ログイン（セッション Cookie を発行） |
| `POST /api/auth/logout` | なし | ログアウト |
| `GET /api/auth/me` | ログイン | ログイン中のユーザー |
| `GET /api/attendance/today` | 従業員 | 今日の打刻状況と、今押せる打刻 |
| `POST /api/attendance/punch` | 従業員 | 打刻。今の状態で押せない打刻は 409 |
| `GET /api/attendance?month=&userId=` | ログイン | 月ごとの勤怠。従業員が他人の `userId` を指定すると 403 |
| `GET /api/admin/employees` | 管理者 | 従業員の一覧 |
| `GET /api/admin/summary?month=` | 管理者 | 月次集計 |
| `PUT /api/admin/attendance` | 管理者 | 勤怠の修正。入力に誤りがあれば 400 と理由 |
| `GET /api/admin/export?month=&userId=` | 管理者 | CSV 出力（`userId=all` で全員） |
| `GET /api/admin/missing-clock-outs` | 管理者 | 打刻漏れの検出記録 |
| `POST /api/admin/missing-clock-outs` | 管理者 | 指定日の打刻漏れを手動で検出 |
| `GET /api/cron/detect-missing-clock-outs` | `CRON_SECRET` | 前日の打刻漏れを検出（外部スケジューラ用） |

## 毎日 0 時の打刻漏れ検出

前日の「出勤だけで退勤がない」勤怠を検出して記録し、管理者が `/admin/missing` で確認できます。動かし方は 2 通り用意しています。

1. **常駐サーバー（`npm run dev` / `npm start`）**：`instrumentation.ts` がサーバー起動時にスケジューラを登録し、日本時間の 0:00 に検出を実行します。データがサーバーのメモリにあるので、この構成が基本です。
2. **Vercel などのサーバーレス環境**：`vercel.json` の Cron 設定で、毎日 15:00 UTC（日本時間 0:00）に `/api/cron/detect-missing-clock-outs` を呼びます。`CRON_SECRET` を設定してください。

初期データには、これまで定期処理が動いていた想定で、2 件の打刻漏れの検出記録を入れてあります。

## ディレクトリ構成

```
app/            画面と API（Route Handler）
components/     画面の部品、テーマ設定（theme.ts）、全画面に効くプロバイダー（Providers.tsx）
lib/            画面とサーバーで共有する処理（計算ルール、日付、打刻の状態遷移、入力チェック、CSV）と、アクセス解析
server/         サーバー側だけの処理（モックのデータ層、初期データ、認証、定期処理）
tests/          単体テスト
proxy.ts        未ログイン時のリダイレクト
instrumentation.ts  定期処理の起動
```
