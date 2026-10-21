---
layout: section
routeAlias: what-is
---

<div class="section-num">01</div>

# Nuxtの基本

<div class="section-sub">画面とサーバーを、1つのプロジェクトで扱うフレームワーク</div>

---

# こんなことありませんか？

<div class="sub">PoCを来週までに動かしたい。小さなアプリでも、要るものは一通りある</div>

<div class="cols">
<div class="card">
<div class="col-h">要るもの</div>

- **画面**：一覧、詳細、入力フォーム
- **API**：データの読み書き
- **ログイン**：誰が使っているか

</div>
<div class="card">
<div class="col-h">ばらばらに作ると</div>

- **画面**：ReactやVueのプロジェクトを作る
- **API**：別のサーバーを立てる
- **つなぎ**：起動手順やCORS、型の共有を自分で用意する

</div>
</div>

<div v-click class="ask">画面とAPIを、もっと手軽にまとめて作れないでしょうか？</div>

---
class: roomy
---

# 画面とサーバーをまとめるフレームワーク

<div class="sub">UIライブラリごとに、サーバー側の処理まで面倒を見るフレームワークがある</div>

| UIライブラリ | フレームワーク |
|---|---|
| React | Next.js |
| Vue | **Nuxt** |
| Svelte | SvelteKit |

- **SSR**：サーバーでHTMLを作って返し、ブラウザで動きを付ける。Nuxtは既定でこの方式
- **APIも同じ場所に**：画面と同じプロジェクトに、サーバーの処理を書ける

<div v-click class="punch">今回は、Vueをベースにした<b>Nuxt</b>を紹介する</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/guide/concepts/rendering" target="_blank">Nuxt：Rendering Modes</a></div>

---
class: roomy
---

# Nuxtの特徴

<div class="sub">Vueの画面に、サーバーと「置き場所の決まり」を足したフレームワーク</div>

<div class="flow">
  <div class="step">Vue<small>画面</small></div>
  <lucide-plus class="arrow" />
  <div class="step">Nitro<small>サーバー</small></div>
  <lucide-arrow-right class="arrow" />
  <div class="step lit">Nuxt<small>1つのプロジェクト</small></div>
</div>

1. **ルーティングを書かずに始められる**：置き場所でURLや役割が決まる（フォルダの決まり）
2. **importを書かなくていい**：部品や関数がそのまま使える（自動インポート）
3. **APIも同じプロジェクトで書ける**：別のサーバーを立てなくていい（`server/api`）
4. **機能を1コマンドで足せる**：認証やLintもすぐ入る（テンプレートとモジュール。02で紹介）

<div class="note">現行はNuxt 4（2026.10時点の最新は4.6）。Node.jsのサーバー、サーバーレス、静的ファイルなどに出力できる</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/getting-started/introduction" target="_blank">Nuxt：Introduction</a>・<a href="https://www.npmjs.com/package/nuxt" target="_blank">npm：nuxt</a></div>

---

# ① ルーティングを書かずに始められる

<div class="sub">フォルダの決まり：どこに何を置くかで、URLや役割が決まる</div>

<pre class="tree"><span class="t">my-app/</span>
  <span class="t">app/</span>
    <span class="p">pages/</span>        <span class="muted">画面（ファイル名がURLになる）</span>
    <span class="p">components/</span>   <span class="muted">画面の部品（importなしで使える）</span>
    <span class="p">composables/</span>  <span class="muted">画面で使い回す処理</span>
  <span class="t">server/</span>
    <span class="p">api/</span>          <span class="muted">API（ファイル名がURLになる）</span>
  <span class="v">nuxt.config.ts</span>  <span class="muted">主な設定はここに集まる</span></pre>

<div v-click class="punch">メリット：置き場所に迷わず、誰が書いても同じ構成になる</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/directory-structure" target="_blank">Nuxt：Directory Structure</a></div>

---

# ② importを書かなくていい：.vueファイルで見る

<div class="sub">Vueが用意している部分と、Nuxtが足している部分を分けて見る</div>

<div class="cols middle">
<div>

<div class="where"><lucide-file-code /> app/pages/users.vue</div>

```vue
<script setup lang="ts">
// import文がない
const { data: users } = await useFetch('/api/users')
</script>

<template>
  <ul>
    <li v-for="u in users" :key="u.id">{{ u.name }}</li>
  </ul>
</template>
```

<div v-click class="punch">メリット：import文が減り、ファイルを開くと画面の中身から読める</div>

</div>
<div>

<div class="card">
<div class="col-h">Vueの仕組み</div>

- **script**：データとロジック
- **template**：見た目。`v-for`で繰り返し、<code v-pre>{{ }}</code>で値を出す

</div>

<div class="card" style="margin-top: 0.8rem">
<div class="col-h">Nuxtが足すもの</div>

- **自動インポート**：`useFetch`や`ref`をimportなしで使える
- **useFetch**：サーバーでもブラウザでも同じ書き方でデータを取る

</div>
</div>
</div>

<div class="source"><lucide-link /><a href="https://ja.vuejs.org/guide/scaling-up/sfc" target="_blank">Vue.js：単一ファイルコンポーネント</a>・<a href="https://nuxt.com/docs/4.x/guide/concepts/auto-imports" target="_blank">Nuxt：Auto-imports</a>・<a href="https://nuxt.com/docs/4.x/api/composables/use-fetch" target="_blank">Nuxt：useFetch</a></div>

---

# ② importを書かなくていい：composableも

<div class="sub">自作の処理も、置くだけでどの画面からでも呼べる</div>

<div class="cols">
<div>

<div class="where"><lucide-file-code /> app/composables/useMonthlyRecords.ts</div>

```ts
export function useMonthlyRecords(month: Ref<string>) {
  // monthが変わると、自動で取り直す
  return useFetch('/api/records', { query: { month } })
}
```

<div class="where"><lucide-file-code /> app/pages/records.vue</div>

```ts
const month = ref('2026-10')
const { data: records } = useMonthlyRecords(month)
```

</div>
<div>

- **composable（Vue）**：状態と処理をまとめた関数。Reactのカスタムフックに近い
- **ref（Vue）**：変わる値を入れる箱。中身は`.value`で読み書きする
- **Nuxtが足すもの**：`app/composables/`に置くと、importなしで呼べる

</div>
</div>

<div v-click class="punch">メリット：画面をまたぐ処理を、置くだけで使い回せる</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/directory-structure/app/composables" target="_blank">Nuxt：composables/</a>・<a href="https://nuxt.com/docs/4.x/api/composables/use-fetch" target="_blank">Nuxt：useFetch</a></div>

---
routeAlias: what-is-point
class: roomy
---

# ③ APIも同じプロジェクトで書ける

<div class="sub">server/apiにファイルを置くと、そのままAPIになる</div>

<div class="cols">
<div>

<div class="where"><lucide-server /> server/api/users.ts</div>

```ts
export default defineEventHandler(() => {
  return [
    { id: 1, name: '佐藤' },
    { id: 2, name: '鈴木' },
  ]
})
```

</div>
<div>

<div class="where"><lucide-globe /> app/pages/users.vue</div>

```ts
const { data: users } =
  await useFetch('/api/users')
```

<div class="note">ファイル名の<code>users.ts</code>が、そのまま<code>/api/users</code>になる</div>
</div>
</div>

<div v-click class="punch">メリット：画面とAPIを1つのリポジトリで管理し、まとめてデプロイできる</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/directory-structure/server" target="_blank">Nuxt：server/</a></div>
