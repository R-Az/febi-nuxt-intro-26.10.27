# next-2-add：ブラウザ操作での再判定（2026-10-21）

- 環境：Node 24.21.0、npm ci、開発サーバー（ポート 3608、`http://next-2-add.localhost:3608/`）
- 判定した人：Claude（このセッションのサブエージェント）。人による確認はしていない

| 条件 | 判定 | 確かめ方（画面・fetch・コマンド） | 根拠 | 前回の判定 |
|---|---|---|---|---|
| 1 ログイン | ○ | 画面・fetch | 未ログインで `/punch` を開くと `/login` に移った。誤ったパスワードで「メールアドレスまたはパスワードが正しくありません。」が出た。正しいパスワードで `/punch` に移り、ヘッダーの「ログアウト」で `/login` に戻った。ログアウト後の `/api/auth/me` は 401 | ○ |
| 2 打刻 | ○ | 画面・fetch | 出勤前は「出勤」だけ押せ、休憩開始・休憩終了・退勤は disabled。出勤→休憩開始→休憩終了→退勤をボタンで押し、各段階で押せるボタンが切り替わった（休憩中は休憩終了だけ、退勤後は4つとも disabled）。退勤後に fetch で出勤を POST すると 409「今の状態（退勤済み）では「出勤」を打刻できません。」 | ○ |
| 3 自分の勤怠一覧 | ○ | 画面 | E001で「前の月」ボタンを押すと 2026-09 に切り替わり、日ごとの出勤・退勤・休憩・実働・残業と合計（出勤22日、実働201:43、残業25:43）が出た。2026-10 は出勤15日、実働126:09、残業15:03 | ○ |
| 4 計算ルール | ○ | 画面 | 手計算：E001の10/01は 09:11〜19:35、休憩1:00 で実働9:24・残業1:24、09/01は 09:17〜19:48、休憩0:45 で実働9:46・残業1:46。画面と一致。E002の10/20は退勤が空で、実働・残業・状態が「打刻漏れ」、上部の打刻漏れ1件 | ○ |
| 5 管理者の月次一覧 | ○ | 画面 | 管理者の `/admin`（2026-10）で E001 15日・126:09・15:03・0件、E002 14日・114:39・11:36・1件。従業員の画面の合計と一致。「前の月」で 2026-09 に切り替え、E001 201:43・25:43 も一致 | ○ |
| 6 管理者の修正 | ○ | 画面 | `/admin/attendance` で E001 の10/01の「修正」を押し、Modal で出勤18:00・退勤09:00にして保存すると、PUT が 400、Modal 内に「退勤時刻は出勤時刻より後にしてください。」と休憩の範囲エラーが出た。09:00〜18:30 にすると保存され、行が実働8:30・残業0:30、合計が125:15・14:09 に変わった。月次集計 API も実働7515分（125:15）に反映 | ○ |
| 7 CSV | ○ | 画面・fetch | `/admin/export` の「CSVをダウンロード」を押し、`/api/admin/export?month=2026-10&userId=all` が 200。fetch で中身を確認：text/csv; charset=utf-8、attachment（`attendance_2026-10_all.csv`）、先頭 EF BB BF、CRLF、見出しは指示どおりの列順、日付 YYYY-MM-DD・時刻 HH:MM、打刻漏れ2行（E002 10-20、E004 10-16）は実働・残業が空で備考「打刻漏れ」。1人分（E004）も E004 の行だけ。修正した10/01 は 09:00,18:30,60,510,30。Excelでの見た目は確かめられない | ○ |
| 8 権限 | ○ | fetch | E001でログイン中に、E002 の attendance・today・punches POST、管理者 API（employees、monthly-summary、export、missing-punches GET/POST、attendance PUT）がすべて 403。自分の attendance は 200。ログアウト後は me、attendance、today、punches、admin 系がすべて 401 | ○ |
| 9 定期処理 | ○ | 画面・コード | `/admin/missing-punches` に起動時の補完で検出した E002 10-20（未修正）と実行履歴が出た。日付 2026-10-16 で「検出を実行」を押すと「検出しました（1件）」が出て E004 10-16 が一覧と履歴（きっかけ：手動）に追加。`instrumentation.ts` から `startMissingPunchScheduler()` を起動し、`msUntilNextTokyoMidnight()+1秒` の setTimeout で毎日0時に実行 | ○ |
| 10 テスト | ○ | コマンド | `npm test`：7ファイル47件すべて成功 | ○ |
| 11 ビルド | ○ | コマンド・画面 | `npm run typecheck` 成功（終了コード0）、`npm run build` 成功（終了コード0）。開発サーバーで7画面（login、punch、attendance、admin、admin/attendance、admin/export、admin/missing-punches）を開いて表示を確認 | ○ |
| 12 README | ○ | 手順どおり実行 | README の `npm install` の代わりに `npm ci`、`npm run dev`（ポート指定のみ追加）で起動でき、README のアカウント一覧で全役割にログインできた | ○ |
| A1 UI部品 | ○ | 画面・コード | 5画面とも Mantine の部品（Button、TextInput/PasswordInput、Table、Modal、NativeSelect、Badge、Card）で表示（クラス `mantine-Button-root` など。missing-punches の main 内に mantine クラスの要素81個）。ソースに生の `<button>/<input>/<table>/<select>` は0件。太陽・月のボタンで `data-mantine-color-scheme` が dark→light に変わり、背景が rgb(36,36,36)→白に変わった。初期は OS 設定に合わせてダーク | ○ |
| A2 カスタマイズ | ○ | getComputedStyle・画面・コード | 主色：`--mantine-primary-color-filled` がライトで #0f766e、ダークで #14b8a6（選択中のナビはライトで背景 rgb(204,251,241)・文字 rgb(19,78,74)）。角の丸み：ボタン・入力欄・セレクトとも 4px。書体：body と input が "Noto Sans JP" で、`document.fonts.check` が true。表：td の上下 padding 4px、行の高さ約30.7px。設定は `lib/theme.ts`（createTheme、57行）と `app/layout.tsx` の next/font。部品ごとの style/className はレイアウト用の4か所だけで、見た目の上書きはない | ○ |
| A3 Lint | ○ | コマンド | `npm run lint`（eslint）が出力なしで終了コード0 | ○ |
| A4 計測 | ○ | 画面・JS | Cookie と localStorage を空にして開くと、同意バナーが出て、googletagmanager の script は0件、`window.dataLayer` は undefined、google への通信なし。「同意する」を押すと gtag.js の script が追加され、dataLayer に consent default（analytics_storage granted、広告系 denied）・js・config が入り、`google-analytics.com/g/collect`（en=page_view）が送られた。打刻4回で dataLayer に event punch（clock_in、break_start、break_end、clock_out）が入り、collect に en=punch の送信も出た。読み込みは同意後の next/script（afterInteractive） | ○ |
| A5 既存の動作 | ○ | 1〜12の結果 | 条件1〜12がすべて○。型チェック・テスト・ビルドも成功 | ○ |
| A6 README | ○ | README を読む | 「画面の見た目」「アクセス解析（Google Analytics）」「Lint の実行方法」の節があり、テスト表に analytics.test.ts、ディレクトリ構成に theme.ts と providers.tsx がある | ○ |

## 前回の判定と違ったもの

なし

## 気づいたこと

- 初期データは今日を基準に作られるため、前回（2026-10-20）と日付や打刻漏れの日が違う（今回は E002 の 10-20、E004 の 10-16）。合計の値も前回の記録とは別。
- 一覧系の画面は、開いた直後に「読み込み中…」が一瞬出てから表が出る（画面からAPIを呼ぶ作りのため）。
- 打刻漏れの日も月の「休憩合計」には休憩が足されている（E002 の 10/20 は休憩1:00が表示される）。実働・残業の合計からは除かれており、条件には反しない。
- 修正の Modal で退勤を出勤より前にすると、退勤のエラーに加えて休憩の範囲エラーも2行出る。誤りの原因は1つなので、やや多く見える。
- 画面遷移の後も、前の画面の要素が非表示のまま DOM に残っていた（Next.js の Cache Components の挙動と見られる）。見た目への影響はなかった。
