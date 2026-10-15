# Nuxt モジュール集計

Nuxt 4 で実際に使えるモジュールは **277件** です（一覧の掲載数は 433件）。

- 集計日時: 2026-10-15T07:50:04.291Z
- データ: `@nuxt/modules` 0.6.0-8d66ee（2026-10-14T20:48:46.399Z 公開）と、各モジュールの npm メタデータ
- 生成: `pnpm modules`（`node scripts/count-nuxt-modules.mjs`）。この表の数値はスクリプトの出力だけです

## 「使える」の条件

次をすべて満たすものを数えています。

1. `compatibility.nuxt` の宣言範囲に Nuxt 4 が入っている
2. npm の最新版が deprecated でない
3. npm での最終更新が Nuxt 4.0.0 の公開日（2025-07-15）以降

条件 3 は「メンテナンスが続いているか」の目安です。npm の `modified` はメタデータの変更でも更新されるため、厳密な最終リリース日ではありません。

| 一覧の掲載数から外したもの | 件数 |
| --- | ---: |
| Nuxt 4 を宣言範囲に含まない（Nuxt 2 / 3 専用） | 94 |
| npm の最新版が deprecated | 1 |
| Nuxt 4.0.0 公開以降に npm で更新されていない | 61 |

## 使えるモジュールの内訳

公式系は official（Nuxt チーム）と community（nuxt-modules organization）を合わせた数です。3rd-party には企業の公式モジュールと個人作者のモジュールの両方が入っています。

| 区分 | 件数 |
| --- | ---: |
| 3rd-party | 230 |
| 公式系 | 47 |

| 種類 | 件数 |
| --- | ---: |
| 3rd-party | 230 |
| community | 36 |
| official | 11 |

| カテゴリ | 件数 |
| --- | ---: |
| Libraries | 55 |
| UI | 48 |
| Extensions | 29 |
| Security | 22 |
| Devtools | 21 |
| CMS | 16 |
| Database | 13 |
| Request | 13 |
| SEO | 12 |
| AI | 10 |
| Performance | 9 |
| Analytics | 8 |
| Images | 5 |
| Monitoring | 4 |
| Ecommerce | 3 |
| Payment | 3 |
| CSS | 2 |
| Deployment | 2 |
| Fonts | 2 |

![カテゴリ別件数](categories.svg)
