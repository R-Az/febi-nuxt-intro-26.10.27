---
layout: section
routeAlias: what-is
---

<div class="section-num">01</div>

# Nuxtの基本

<div class="section-sub">画面とAPIを、1つのアプリとして動かすフレームワーク</div>

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

- **画面**：ReactやVueで画面のアプリを作る
- **API**：別のサーバーを立てる
- **つなぎ**：起動手順やCORS、型の共有を自分で用意する

</div>
</div>

<div v-click class="ask">画面とAPIを、もっと手軽にまとめて作れないでしょうか？</div>

---
class: roomy
---

# 画面とサーバーをまとめるフレームワーク

<div class="sub">画面のライブラリごとに、サーバー側の処理まで面倒を見るフレームワークがある</div>

| ベース | フレームワーク |
|---|---|
| React | Next.js |
| Vue | **Nuxt** |
| Svelte | SvelteKit |

- **SSR**：サーバーでHTMLを作って返し、ブラウザで動きを付ける。Nuxtは既定でこの方式
- **APIも同じアプリに**：画面と同じアプリの中に、サーバーの処理を書ける

<div v-click class="punch">今回は、Vueをベースにした<b>Nuxt</b>を紹介します</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/guide/concepts/rendering" target="_blank">Nuxt：Rendering Modes</a></div>

---
layout: center
class: text-center
---

<div class="like">私がNuxtを好きな理由 <span class="badge" style="--c: var(--orange)">私見</span></div>

# Nuxtは、決めることが少ない

<div class="decided">
<div class="card"><div class="col-h">フォルダ構成とURL</div>置き場所で決まる</div>
<div class="card"><div class="col-h">import</div>書かなくていい</div>
<div class="card"><div class="col-h">Lintのルール</div>モジュールが用意する</div>
</div>

<div class="note">フォルダ構成やLintの設定で悩まずに、作りたいものから始められる</div>

<style>
.like { color: var(--comment); font-size: 1rem; margin-bottom: 0.6rem; }
h1 { font-size: 2.6rem !important; }
.decided { display: flex; gap: 1rem; justify-content: center; margin: 1.8rem 0 1.2rem; }
.decided .card { width: 13rem; font-size: 0.95rem; }
</style>

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
  <div class="step lit">Nuxt<small>1つのアプリ</small></div>
</div>

1. **フォルダ構成が決まっている**：置き場所でURLや役割が決まる
2. **importを書かなくていい**：部品や関数がそのまま使える（自動インポート）
3. **APIも同じアプリで動く**：別のサーバーを立てなくていい（`server/api`、定期処理も）
4. **機能を1コマンドで足せる**：認証やLintもすぐ入る（テンプレートとモジュール。02で紹介）

<div class="note">現行はNuxt 4（2026.10時点の最新は4.6）。Node.jsのサーバー、サーバーレス、静的ファイルなどに出力できる</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/getting-started/introduction" target="_blank">Nuxt：Introduction</a>・<a href="https://www.npmjs.com/package/nuxt" target="_blank">npm：nuxt</a></div>

---

# ① フォルダ構成が決まっている

<div class="sub">どこに何を置くかで、URLや役割が決まる。ルーティングも書かなくていい</div>

<pre class="tree"><span class="t">my-app/</span>
  <span class="t">app/</span>
    <span class="p">pages/</span>        <span class="muted">画面（ファイル名がURLになる）</span>
    <span class="p">components/</span>   <span class="muted">画面の部品（importなしで使える）</span>
    <span class="p">composables/</span>  <span class="muted">画面で使い回す処理</span>
  <span class="t">server/</span>
    <span class="p">api/</span>          <span class="muted">API（ファイル名がURLになる）</span>
  <span class="v">nuxt.config.ts</span>  <span class="muted">主な設定はここに集まる</span></pre>

<div class="punch">メリット：置き場所で悩まず、誰が書いても同じ構成になる</div>

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

<div class="punch">メリット：import文が減り、ファイルを開くと画面の中身から読める</div>

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

<div class="punch">メリット：画面をまたぐ処理を、置くだけで使い回せる</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/directory-structure/app/composables" target="_blank">Nuxt：composables/</a>・<a href="https://nuxt.com/docs/4.x/api/composables/use-fetch" target="_blank">Nuxt：useFetch</a></div>

---
class: roomy
---

# ③ APIも同じアプリで動く

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

<div class="note">ファイル名の<code>users.ts</code>が、そのまま<code>/api/users</code>になる。<code>users</code>の型もAPIの戻り値から自動で付く</div>
</div>
</div>

<div v-click class="punch">メリット：画面とAPIが1つのサーバーで動き、デプロイも1回で済む</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/directory-structure/server" target="_blank">Nuxt：server/</a></div>

---

# ③ 定期処理も同じアプリで動かせる

<div class="sub">Nitro Tasks：cron式で、決まった時刻に処理を動かす</div>

<div class="cols">
<div>

<div class="where"><lucide-server /> server/tasks/check-missing.ts</div>

```ts
export default defineTask({
  meta: { name: 'check-missing' },
  async run() {
    // 前日の打刻漏れを探して記録する
    return { result: 'ok' }
  },
})
```

</div>
<div>

<div class="where"><lucide-settings /> nuxt.config.ts</div>

```ts
export default defineNuxtConfig({
  nitro: {
    experimental: { tasks: true },
    // cron式。'0 0 * * *'は毎日0時
    scheduledTasks: { '0 0 * * *': ['check-missing'] },
  },
})
```

</div>
</div>

- **実験的な機能**：有効にするには<code>experimental.tasks</code>の設定が要る
- **デプロイ先が限られる**：定期実行できるのは、Node.jsのサーバーやCloudflareなど

<div class="punch">メリット：定期処理のために、別のサーバーやサービスを用意しなくていい</div>

<div class="source"><lucide-link /><a href="https://v2.nitro.build/guide/tasks" target="_blank">Nitro：Tasks</a></div>

---
routeAlias: what-is-point
---

<div class="kicker">01のまとめ</div>

# 画面とAPIを、1つのアプリで動かす

<div class="sub">置き場所も書き方も決まっているので、悩まずに書き始められる</div>

<div class="cols">
<div class="card">
<div class="col-h">① フォルダ構成</div>

置き場所でURLや役割が決まる。誰が書いても同じ構成になる

</div>
<div class="card">
<div class="col-h">② 自動インポート</div>

部品や関数、自作のcomposableをimportなしで使える

</div>
<div class="card">
<div class="col-h">③ APIと定期処理</div>

<code>server/api</code>と<code>server/tasks</code>に置けば、別のサーバーは要らない

</div>
</div>

<div class="bridge">④ 機能を1コマンドで足す仕組みは、<b>次のセクション</b>で</div>
