# 05. AI への指示文

用途別に 4 つあります。`{...}` は自分で埋める箇所です。

---

## A. 発表用リポジトリの CLAUDE.md / AGENTS.md

発表資料を作るリポジトリのルートに置く。AI が毎回この前提で動くようにする。

```markdown
# このリポジトリについて
Nuxt の良さを伝える社内/コミュニティ発表の資料と、Nuxt vs Next.js の AI 開発比較検証をまとめるリポジトリ。

## 必ず最初に読むもの
- docs/context/README.md(前提と注意点)
- docs/context/01_nuxt-strengths.md 〜 05_ai-prompts.md

## 守ること
- 事実は docs/context/ と sources.md の範囲で書く。新しい事実を足すときは出典 URL を sources.md に追記する。
- バージョン: Nuxt は 4.x、Next.js は 16.x を前提にする。Nuxt 3 の書き方(例: app/ ディレクトリを使わない構成)を最新として書かない。
- 「SEO やスクリプトが Nuxt に標準搭載」とは書かない。「公式モジュールを 1 コマンドで追加」と書く。
- Next.js を不当に貶めない。比較は 02_nuxt-vs-next.md の公平な記述に従う。
- 検証結果の数値は results/ の JSON からのみ引用する。推測で数値を書かない。
- 日本語で書く。スライドは 1 枚 1 メッセージ。

## ディレクトリ
- docs/context/   調査資料(編集しない。追記は sources.md のみ)
- experiment/     検証用の生成物(nuxt-r1-1/ など)
- results/        計測結果 JSON と集計
- slides/         発表スライド
```

---

## B. 検証用タスク指示

> 2026-10-15 改訂: 題材を勤怠管理アプリ(B2B の業務アプリ)に変え、条件を 1 つ・各フレームワーク 2 回にした。

指示文は **`experiment/prompt.md`** にある。新しいセッション・空のディレクトリで、フレームワーク名だけを変えて **そのまま 1 回だけ** 投入する。

介入のルール、計測のしかた、受け入れ条件の判定手順、記録の形式は `experiment/README.md` にある。修正方法は教えず、決まった文面だけを返す。

---

## C. 計測結果の集計を AI に頼む指示

```text
results/experiment/ 以下の JSON(experiment/README.md の「記録の形式」)を読み、次を作ってください。

1. experiment/report-template.md のひな形に沿った results/experiment/summary.md。Nuxt と Next.js それぞれ、各指標の 2 回の平均と、1 回目・2 回目の値を並べる。
2. 次のグラフを SVG で results/experiment/charts/ に出力するスクリプト(Node)を scripts/ に作る
   - 出力トークン比較(棒グラフ、1 回目・2 回目を並べる)
   - 入力 + キャッシュトークン比較
   - 所要時間と介入回数
   - 生成コード行数(うち import 行数を色分け)
   - 受け入れ条件の達成状況(条件 × 実行の表)
3. 結果がどのストーリー分岐(04_presentation-proposal.md の表)に当てはまるかの判定と、その根拠

注意:
- 数値は JSON にあるものだけを使い、推測で補完しない。
- 各 2 回しかないので「有意」「証明」という言葉は使わず「傾向」と書く。
```

---

## D. 発表スライド作成を AI に頼む指示

```text
docs/context/ の資料と results/experiment/summary.md をもとに、発表スライドの原稿を slides/ に作ってください。

- 構成は 04_presentation-proposal.md の「構成案」に従う。持ち時間は {20 or 30} 分。
- 形式: {Slidev の Markdown / Marp / PowerPoint 用のアウトライン} 
- 1 枚 1 メッセージ。各スライドに「見出し」「本文(3 行以内)」「図やコード」「話す内容(スピーカーノート)」を書く。
- コード例は 02_nuxt-vs-next.md のものを使い、Nuxt 4 / Next.js 16 の書き方にする。
- 検証パートは results/experiment/summary.md の数値とグラフのみ使い、ストーリー分岐の判定に沿って語る。
- 「Next.js の強み」スライドを必ず入れる。
- 最後に想定質疑(02 の 5 章)をスピーカー用の付録として付ける。
- 事実を足したくなったら、書く前に出典を確認して sources.md に追記する。確認できない事実は書かない。
```

---

## E.(任意)自作スターターテンプレートを AI に作らせる指示

発表デモ用。

```text
Nuxt 4 で、新規 Web アプリ用のスターターテンプレートを作ってください。
`npm create nuxt@latest my-app -- -t github:{org}/{repo}` で使う前提の、普通の Nuxt プロジェクトとして作ります(Nuxt Layers は使わない)。

- 導入するモジュール: @nuxt/ui, @nuxtjs/seo, @nuxt/scripts, @nuxt/image, @nuxt/fonts, @nuxt/eslint
- すべて `npx nuxi module add` で入れ、設定は nuxt.config.ts に集約する
- サイト名・URL・GA の測定 ID は .env で変えられるようにする
- ダークモード対応のデフォルトレイアウト(ヘッダー・フッター)とトップページを 1 枚だけ置く
- README に「新規プロジェクトでの使い方」を 5 ステップ以内で書き、入っているモジュールの一覧と役割を表にする
```

## F. モジュール数をカテゴリ別に集計する指示(発表の目玉スライド用)

```text
@nuxt/modules パッケージ(https://github.com/nuxt/modules)のデータを使って、Nuxt モジュールをカテゴリ別・種類別(official / community / 3rd-party)に集計するスクリプトを作ってください。

- 出力: 総数、カテゴリ別件数(降順)、種類別件数、Nuxt 4 対応(compatibility)の件数
- グラフを SVG で 1 枚出力(カテゴリ別の横棒グラフ)
- 集計日時とデータのバージョンをグラフ内に明記する
- 数値はスクリプトの出力だけを使い、推測で書かない
```
