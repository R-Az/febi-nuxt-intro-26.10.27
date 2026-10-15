# 03. 検証企画:同じ指示を AI に出したら Nuxt と Next.js で何が違うか

## 1. 問い

> 同じ AI・同じ指示で同じ Web アプリを作らせたとき、Nuxt と Next.js で
> **トークン消費量・所要時間・人の介入回数・完成度** はどう違うか?

## 2. 仮説(事前に宣言しておく)

- H1: Nuxt は自動インポートと規約により **出力トークンと生成コード行数が少ない**。
- H2(本命): エコシステムを使うラウンドでは、Nuxt はモジュール追加で済むため **SEO・スクリプト周りの実装量と手戻りが少なく、追加依存の入れ方も一貫している**。→ R1 と R2 の差(エコシステムの効き目)が Nuxt の方が大きいはず。
- H3(反証候補): 学習データ量の差で **Next.js の方がエラーや手戻りが少ない** 可能性もある(Web-Bench の結果)。
- どの結果でも発表が成立するようにする:「Nuxt が楽だった」でも「AI だと Next の方が楽だった、でも人間が読むコード量は Nuxt が少ない」でもネタになる。

## 3. 実験条件(2ラウンド × 2フレームワーク)

| ラウンド | 狙い | Nuxt 側 | Next.js 側 |
| --- | --- | --- | --- |
| **R1: 素の比較** | フレームワーク本体の規約の差を見る | `npm create nuxt@latest`(追加モジュールなし) | `create-next-app`(App Router, TS, Tailwind) |
| **R2: エコシステム込み** | 「普段使う構成」での差を見る(発表の本命) | `@nuxt/ui`, `@nuxtjs/seo`, `@nuxt/scripts` を使ってよい | shadcn/ui, `@next/third-parties`, Next 標準の Metadata/sitemap/robots を使ってよい |
| (任意)**R3: 自作テンプレート** | テンプレート+モジュールの効果を見る | 自作スターター(必要モジュール導入済み)から `npm create nuxt -- -t github:...` で開始 | 同等の自作スターター(shadcn/ui 等導入済み)から `create-next-app --example` で開始 |

R1 で「AI に使わせない」ためには、指示文に「追加の npm パッケージを入れないこと」と明記する。

### 固定する条件
- 同じ AI エージェント・同じモデル・同じバージョン(例: Claude Code + 同一モデル。記録必須)
- 毎回 **新しいセッション**、同じ空ディレクトリ構成
- 同じ指示文(`05_ai-prompts.md` の「検証用タスク指示」)。フレームワーク名以外は一字一句同じ
- MCP: **両方オフ** で統一(公式 MCP の効果を見たい場合は別条件として「両方オン:Nuxt MCP / Next DevTools MCP」を追加)
- `CLAUDE.md` / `AGENTS.md` は置かない、または両方に同じ中身を置く
- Node / パッケージマネージャのバージョン固定
- 各条件 **最低 3 回** 実行(LLM の出力はぶれるので中央値で比較)

## 4. 題材アプリ:「勉強会イベント告知+参加登録」ミニアプリ

Nuxt の強み(SEO・Scripts・サーバー処理・UI)が全部出て、1 時間程度で終わる規模。

### 受け入れ条件(AI への指示にも、合否判定にも使う)
1. トップページ: イベント一覧(カード表示、レスポンシブ、ダークモード対応)
2. 詳細ページ: `/events/[id]` 動的ルート
3. 参加登録フォーム: 名前・メールを送信 → サーバー API で受け取りメモリ or JSON ファイルに保存 → 完了表示。バリデーションあり
4. API: `GET /api/events`、`POST /api/events/[id]/register`
5. SEO: 各ページの title / description / OGP、`/sitemap.xml`、`/robots.txt`、イベント詳細に JSON-LD(Event)
6. Google Analytics(測定 ID はダミー)を読み込む。可能ならページ表示後に遅延読み込み
7. 定期処理: 過去イベントの登録データを 1 日 1 回削除する仕組み(フレームワークで書けない場合は「書けない」と報告させる)
8. `npm run build` が成功し、`npm run dev` で全ページが表示されること

※ 7 は Nuxt(Nitro Tasks)と Next(標準なし)で差が出る項目。公平性のため「プラットフォームの機能を使う設定ファイルでもよい」と許容する。

## 5. 計測指標

| 指標 | 取り方 |
| --- | --- |
| トークン(input / output / cache read / cache creation) | Claude Code の `/usage`、または `ccusage claude session --json`(セッション単位) |
| 推定コスト | 同上 |
| 所要時間(壁時計) | 指示投入〜受け入れ条件を満たすまで |
| ターン数・人の介入回数 | エラーを貼り直した回数、追加指示の回数 |
| ビルド・型エラー回数 | セッションログから集計 |
| 生成コード量 | `cloc` で自作ファイルのみ(`node_modules`, `.nuxt`, `.next` 除外)。import 行数も別集計 |
| 追加依存数 | `package.json` の dependencies 差分 |
| 受け入れ条件の達成数 | 上の 8 項目を ○/△/✗ で判定(可能なら Playwright で自動化) |
| 品質 | Lighthouse(Performance / SEO / Accessibility)、JS バンドルサイズ |

**output トークン** と **生成コード量** が「書く量の少なさ」、**input/cache** が「AI がどれだけファイルやドキュメントを読み回ったか」を表す。発表ではこの2つを分けて見せると説得力が出る。

## 6. 結果の記録フォーマット

`results/{round}-{framework}-{n}.json`
```json
{
  "round": "R2",
  "framework": "nuxt",
  "run": 1,
  "agent": "Claude Code x.y.z",
  "model": "<model id>",
  "tokens": { "input": 0, "output": 0, "cache_read": 0, "cache_creation": 0 },
  "cost_usd": 0,
  "wall_time_min": 0,
  "turns": 0,
  "human_interventions": 0,
  "build_errors": 0,
  "loc": { "total": 0, "import_lines": 0 },
  "added_dependencies": [],
  "acceptance": { "1": "o", "2": "o", "3": "o", "4": "o", "5": "o", "6": "o", "7": "o", "8": "o" },
  "lighthouse": { "performance": 0, "seo": 0, "accessibility": 0 },
  "notes": ""
}
```

## 7. 公平性・限界(発表で必ず明示)

- n が小さい(3回程度)ので「傾向」であって統計的な結論ではない。
- 単一モデル・単一エージェントの結果。モデルが変われば変わる。
- 学習データ量の差(Next の方が多い)は条件として制御できない。むしろそれ込みの「現実の使い心地」を測っている。
- 指示文の書き方が片方に有利にならないよう、フレームワーク固有の用語は入れない(「API を作って」とだけ書き、`server/api` や `route.ts` とは書かない)。
- 人の介入の基準を事前に決めておく(例: エラーが出たらログを貼るだけ。修正方針は指示しない)。

## 8. 進め方(目安)

1. 指示文とリポジトリ構成を固定(半日)
2. R1・R2 各 3 回ずつ × 2 フレームワーク = 12 セッション(1 セッション 30〜60 分)
3. 集計・グラフ化
4. 発表資料に反映(結果がどう出ても `04` のストーリー分岐を使う)
