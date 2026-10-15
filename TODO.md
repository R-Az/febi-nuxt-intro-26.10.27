# 発表準備 TODO

発表日: 2026-10-27(FEBi)。資料: `docs/context/`。順番は 検証 → 集計 → スライド → デモ。

## 0. 前提の整理(最初に)

- [ ] `/kickoff` でピッチ・構成・却下したアイデア(Nuxt Layers など)・進め方を `CLAUDE.local.md` に記録する
- [ ] 尺を決める: `04` の構成案は 20〜30 分、FEBi の枠は内容 50 分まで。足りない分をどこで増やすか(検証パート、デモ、質疑対策)
- [x] フォルダを用途別に分ける(`slides/`、`demo/`、`experiment/`、`scripts/`、`results/`、`docs/`)
- [ ] `05-A` の CLAUDE.md は既存の CLAUDE.md を上書きせず、必要な「守ること」だけ `CLAUDE.local.md` に移す
- [x] `package.json` の `"name"` を `febi-nuxt-intro-26.10.27` に変更

## 1. 検証(AI に同じ指示を出して比較。`03`、`05-B`)

- [ ] 実験条件を固定して記録: エージェント・モデル・バージョン、Node / パッケージマネージャ、MCP オフ、CLAUDE.md なし
- [ ] 介入ルールを事前に確定(`05-B` の定型文のみ返す)
- [ ] 計測手段を準備: `ccusage`、`cloc`、Lighthouse、受け入れ条件 8 項目の判定(できれば Playwright で自動化)
- [ ] R1-Nuxt × 3 回
- [ ] R1-Next × 3 回
- [ ] R2-Nuxt × 3 回
- [ ] R2-Next × 3 回
- [ ] (任意)R3: 自作スターター(`05-E`)から開始する条件
- [ ] (任意)MCP オン条件(Nuxt MCP / Next DevTools MCP)
- [ ] 各セッションの結果を `results/{round}-{framework}-{n}.json` に記録(`03` の 6 章フォーマット)
- [ ] 生成物を `experiment/nuxt/`、`experiment/next/` に保存

## 2. 集計

- [x] モジュール数のカテゴリ別集計(`05-F`)→ `results/modules/`(2026-10-15 時点で Nuxt 4 で使えるもの 277 件。掲載は 433 件)
- [ ] 発表前日〜当日にモジュール数を再集計(`pnpm modules`)し、nuxt.com/modules の表示件数とも突き合わせる
- [ ] 検証結果の集計(`05-C`): `results/summary.md` と `results/charts/*.svg`(トークン、時間・介入回数、コード行数)
- [ ] ストーリー分岐(`04`)のどれに当たるか判定
- [ ] 第三者の数値(GitHub スター数、npm 週間 DL 数)を一次情報で再確認
- [ ] 事実関係の再確認: Nuxt 4.5 / Nuxt 3 EOL / Next.js 16 / Nuxt UI v4 無料化 / Nitro Tasks の experimental 状況

## 3. スライド(`slides/` の `slides.md` + `pages/`)

- [ ] 表紙・アジェンダ
- [ ] つかみ・Nuxt とは
- [ ] 爆速の理由① 規約(自動インポート、Nuxt / Next のコード比較)
- [ ] 爆速の理由② モジュール(カテゴリ別グラフ、`nuxi module add` で入れ方が統一)
- [ ] テンプレートは薄くていい(`npm create nuxt -- -t github:...`)
- [ ] サーバー処理(`server/api`、Nitro Tasks の注意点込み)
- [ ] 検証: 条件・指標・結果グラフ・限界(n が小さい、単一モデル)
- [ ] 公平に: Next.js の強み
- [ ] 振り返り・まとめ(どんなときに Nuxt を選ぶか)・締め
- [ ] 主張ごとにスライド上に出典をつける(数値・サポート情報は日付つき)
- [ ] 想定質疑(`02` 5 章)を発表者ノートか付録に
- [ ] `/review` で独立レビュー → 修正
- [ ] `pnpm check`(`/preflight`)

## 4. デモ(`04` のデモ計画)

- [ ] デモ用プロジェクトを `demo/` に用意: `npm create nuxt@latest demo -- -t ui` → `nuxi module add @nuxtjs/seo` → `nuxi module add scripts`
- [ ] `/sitemap.xml`、`/robots.txt`、OGP が出ることを確認
- [ ] (任意)自作スターターテンプレートを GitHub に置き、`-t github:...` で立ち上げる流れ
- [ ] ネットワーク不調時の録画バックアップ
- [ ] 本番と同じ環境でリハーサル(所要時間を計る)
