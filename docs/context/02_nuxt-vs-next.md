# 02. Nuxt vs Next.js 比較

比較対象: Nuxt 4.x(Vue 3)/ Next.js 16.x(React 19.2, App Router)
方針: Nuxt の発表だが、比較は公平に。Next の強みを先に認めておくと質疑で崩れない。

---

## 1. 基本情報

| 項目 | Nuxt | Next.js |
| --- | --- | --- |
| ベース | Vue 3 | React 19.2 |
| 現行 | 4.x(4.5: 2026-07)/ v5 安定化中 | 16.x(16.0: 2025-10、16.2: 2026-03)Active LTS |
| サーバーエンジン | Nitro(独立 OSS、他フレームワークでも利用) | Next.js 内蔵 |
| バンドラ | Vite | Turbopack(16 からデフォルト) |
| 開発元 | Nuxt チーム(2025-07〜 Vercel が資金提供、MIT・独立ガバナンス維持を表明) | Vercel |
| 規模感 | GitHub ★約6万、npm 週約140万DL(2026-05) | GitHub ★約14万、npm 週約4,000万DL(2026-05) |

※ 規模の数値は 2026-05 時点の第三者集計。発表で使う場合は当日に npm / GitHub で再確認すること。

---

## 2. 開発体験の違い(ここが発表の核)

| 観点 | Nuxt | Next.js |
| --- | --- | --- |
| import | **自動インポート**(コンポーネント・composable・Vue API) | 明示的に import が必要 |
| 拡張の仕組み | **モジュール**(`modules: [...]` に足すとフックまで自動配線) | 公式のモジュール機構はない。npm パッケージを個別に組み込む |
| モジュール一覧 | **公式一覧 nuxt.com/modules に数百件**。Official / Community / 3rd-party に分類、`nuxi module add` で統一的に導入 | 公式の一覧・統一インストール手段なし |
| テンプレート | `npm create nuxt -- -t github:...` で公式・自作どちらも 1 コマンド | `create-next-app --example` で公式例や GitHub リポジトリから作成可 |
| ルーティング | `pages/` ファイルベース | `app/` ファイルベース(App Router) |
| サーバー/クライアント | 基本はユニバーサル(SSR+ハイドレーション)。境界を意識する場面が少ない | Server / Client Components を区別(`'use client'`)。強力だが学習・判断コストあり |
| データ取得 | `useFetch` / `useAsyncData`(SSR→クライアント受け渡し自動) | Server Component 内で `fetch`、Server Actions |
| キャッシュ | `routeRules`(ページ単位で SSR/SSG/ISR/SPA を宣言) | Cache Components(`'use cache'` で明示的にキャッシュ) |
| API | `server/api/*.ts` | `app/api/*/route.ts`(Route Handlers)/ Server Actions |
| 定期処理 | Nitro Tasks(experimental) | フレームワーク標準はなし(Vercel Cron 等のプラットフォーム機能を使う) |
| UI 公式ライブラリ | Nuxt UI v4(無料、125+ コンポーネント、テンプレート多数) | 公式はなし。shadcn/ui がデファクト |

### コードで見る差(スライド用の例)

**Nuxt**
```vue
<!-- pages/index.vue -->
<script setup lang="ts">
const { data: posts } = await useFetch('/api/posts')   // import 不要
useSeoMeta({ title: 'ブログ', ogTitle: 'ブログ' })
</script>
<template>
  <UContainer>
    <PostCard v-for="p in posts" :key="p.id" :post="p" /> <!-- import 不要 -->
  </UContainer>
</template>
```

**Next.js**
```tsx
// app/page.tsx
import type { Metadata } from 'next'
import { PostCard } from '@/components/post-card'

export const metadata: Metadata = { title: 'ブログ', openGraph: { title: 'ブログ' } }

export default async function Page() {
  const posts = await fetch(`${process.env.API_URL}/api/posts`).then(r => r.json())
  return (
    <main className="container mx-auto">
      {posts.map((p: Post) => <PostCard key={p.id} post={p} />)}
    </main>
  )
}
```

---

## 3. Next.js の強み(公平に認める)

- **エコシステムと人材の規模**が圧倒的。SaaS の SDK は React 向けが先に出ることが多い。
- **SEO はコア標準の範囲が Nuxt より広い**: Metadata API、`sitemap.ts` / `robots.ts` / `opengraph-image` などのファイル規約がフレームワーク本体にある。Nuxt はコアは `useSeoMeta` までで、sitemap 等はモジュール追加が必要。→ 「SEO が標準で入っている」を Nuxt の差別化ポイントにするのは危険。差別化は「モジュールでまとめて入る・統一的に設定できる」点。
- サードパーティスクリプトも `@next/third-parties` がある(GA / GTM / YouTube / Maps 等)。ただし Nuxt Scripts の方が対象数・First-Party Mode・同意管理などで機能が厚い。
- **AI の生成精度**: Web-Bench(2025)では LLM の正答率は Next > Nuxt。一方で同論文は、Next.js の API がバージョン間で安定しておらず、Server/Client Components の区別で LLM が混乱しうると指摘。
- Vercel は Next.js 向けの AI エージェント評価(Next.js Evals)を公開しており、トークン使用量も指標に含めている。v0 や Lovable など AI 生成プラットフォームは React/Next がデフォルト。
- Next.js 16 には DevTools MCP があり、AI デバッグ連携は Next も進んでいる。

## 4. Nuxt が勝ちやすい領域(発表の主張にしてよい部分)

1. **モジュールの数と入れ方の統一**(★本命): 数百のモジュールが公式一覧にまとまり、どれも `nuxi module add` 1 行で導入・自動配線される(SEO 一式、Scripts、UI、Image、Fonts、Content、Auth、i18n)。
2. **テンプレートが薄くて済む**: 機能はモジュールが持つので、自作テンプレートは「modules の並び」程度で十分。
3. **書くコードの少なさ**: 自動インポート+規約。
4. **無料で強い UI 基盤**: Nuxt UI v4 + 公式テンプレート群。
5. **デプロイの自由度**: Nitro でマルチランタイム。
6. **心理的負荷の低さ**: Server/Client 境界を常に意識しなくてよい。

## 5. 想定質疑と回答の方向性

| 質問 | 回答の方向 |
| --- | --- |
| 結局 React の方が人も情報も多いのでは? | その通り。だからチームのスキルと用途で選ぶ。Vue 経験者・少人数・立ち上げ速度重視なら Nuxt が有利 |
| Vercel に買収されて Next と競合しない? | MIT・独立ガバナンス・デプロイ先非依存を公式に表明。有料製品が無料化されたなどむしろ投資が増えた |
| AI は Next の方が得意なのでは? | 素の生成精度ではその研究結果もある。だから今回検証した(→ 検証結果) |
| Next にも npm パッケージは山ほどあるのでは? | 数は React 側が多い。差は「Nuxt 専用に作られ、同じ手順で入り、設定が nuxt.config に集約される」こと |
| 自動インポートは可読性が下がらない? | IDE 上は型が効き、`.nuxt/` に型定義が生成される。好みが分かれる点ではある |
| バッチ処理はできる? | 軽い定期処理なら Nitro Tasks。実験的機能でデプロイ先依存。本格的なジョブは専用サービス |
