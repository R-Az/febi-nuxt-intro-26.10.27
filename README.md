# Nuxt で Web アプリをサクッと作る（FEBi 2026-10-27）

Nuxt はモジュールを 1 コマンドで足せるので、テンプレートから始めてすぐに Web アプリを立ち上げられます。このリポジトリには、その話をする FEBi の発表資料と、裏づけに使う検証・集計・デモをまとめています。

## フォルダ構成

| フォルダ | 中身 |
| --- | --- |
| [`slides/`](slides/) | 発表資料（Slidev デッキ。FEBi テンプレートを使用） |
| [`demo/`](demo/) | 発表のライブデモに使う Nuxt プロジェクト |
| [`experiment/`](experiment/) | AI に同じ指示で勤怠管理アプリを作らせ、Nuxt と Next.js を比べる検証 |
| [`scripts/`](scripts/) | 集計スクリプト |
| [`results/`](results/) | 集計結果（モジュール数、検証の計測データ） |
| [`docs/`](docs/) | 調査資料（[`docs/context/`](docs/context/)） |

発表までの日程とタスクは [ROADMAP.md](ROADMAP.md) にあります。

## コマンド

ルートで実行します。デッキのコマンドは `slides/` に委譲されます。

```bash
pnpm slides:install   # デッキの依存関係を入れる（最初に 1 回）
pnpm dev              # デッキを http://localhost:3030 で表示
pnpm check            # デッキのビルドとチェック（push 前に）
pnpm modules          # Nuxt モジュール数を集計して results/modules/ に出力
pnpm experiment       # 検証の記録を集計して results/experiment/summary.md とグラフを出力
```

`master` に push すると、デッキが GitHub Pages に公開されます。
