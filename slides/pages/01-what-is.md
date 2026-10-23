---
layout: section
routeAlias: what-is
---

<div class="section-num">01</div>

# Nuxtの基本

<div class="section-sub">知っているReactやNext.jsと比べて見る</div>

---

# こんなことありませんか？

<div class="sub">PoCを来週までに動かしたい。小さなアプリでも、画面・API・ログインは一通り要る</div>

<div class="cols split-vs">
<div>
<div class="col-h">画面とAPIを別々に作ると</div>

<div class="box-row">
  <div class="box">画面のアプリ<small>React / Vue</small></div>
  <div class="link">CORS<br>型の共有</div>
  <div class="box">APIサーバー<small>Expressなど</small></div>
</div>

<div class="note">起動もデプロイも2つ。つなぎの部分を自分で用意する</div>
</div>
<div>
<div class="col-h">毎回選び直しているもの</div>

- **構成**：フォルダの分け方、ルーティング
- **道具**：UI部品、認証のライブラリ
- **設定**：Lint、型チェック

</div>
</div>

<div v-click class="ask">画面とAPIをまとめて、しかも毎回悩まずに作れないでしょうか？</div>

<style>
.split-vs .box-row { display: flex; align-items: center; gap: 0.5rem; margin: 0.6rem 0; }
.split-vs .box { flex: 1; padding: 0.7rem 0.5rem; text-align: center; background: var(--panel); border: 1px solid var(--border); border-radius: 6px; font-size: 0.9rem; }
.split-vs .box small { display: block; color: var(--comment); font-size: 0.75rem; }
.split-vs .link { font-size: 0.7rem; color: var(--orange); text-align: center; border-top: 2px dashed var(--orange); padding-top: 0.2rem; }
</style>

---

# 画面とAPIをまとめるフレームワーク

<div class="sub">画面のライブラリごとに、サーバー側の処理まで1つのアプリで扱うフレームワークがある</div>

<div class="cols middle one-app">
<div>

| ベース | フレームワーク |
|---|---|
| React | Next.js |
| Vue | **Nuxt** |
| Svelte | SvelteKit |

</div>
<div>

<div class="frame">
  <div class="inner-row">
    <div class="box">画面</div>
    <div class="box">API</div>
  </div>
  <small>1つのアプリ（1つのサーバー）。Next.jsもNuxtも同じ</small>
</div>

<div class="note">SSR：サーバーでHTMLを作って返し、ブラウザで動きを付ける。Nuxtは既定でこの方式</div>

</div>
</div>

<div v-click class="punch">今回はNuxtを、ReactとNext.jsと比べながら紹介します</div>

<div class="note">Reactを知らなくても大丈夫です。比べるスライドは、右側（Vue / Nuxt）だけ読めば話が追えます</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/guide/concepts/rendering" target="_blank">Nuxt：Rendering Modes</a></div>

<style>
.one-app .frame { padding: 0.8rem; text-align: center; border: 1px solid var(--purple); border-radius: 8px; }
.one-app .inner-row { display: flex; gap: 0.6rem; margin-bottom: 0.5rem; }
.one-app .box { flex: 1; padding: 0.7rem; background: var(--panel); border: 1px solid var(--border); border-radius: 6px; }
.one-app small { color: var(--comment); font-size: 0.75rem; }
</style>

---
layout: center
class: sub-divider
---

<div class="kicker">01-1</div>

# ReactとVueを比べる

<div class="sub">画面の書き方の違い。左にReact、右にVueを並べる</div>

1. **コンポーネント**：見た目をどう書くか
2. **リアクティビティ**：状態が変わったとき、画面がどう更新されるか

---

# コンポーネント：JSXとテンプレート

<div class="sub">違いは、見やすさと書きやすさ</div>

<div class="cols">
<div class="card">
<div class="col-h">React（JSX）</div>

```tsx
export function UserList({ users }: Props) {
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  )
}
```

</div>
<div class="card">
<div class="col-h">Vue（テンプレート）</div>

```vue
<script setup lang="ts">
defineProps<{ users: User[] }>()
</script>

<template>
  <ul>
    <li v-for="u in users" :key="u.id">{{ u.name }}</li>
  </ul>
</template>
```

</div>
</div>

- **JSX**：JavaScriptの中にHTMLのようなマークアップを書く。条件や繰り返しもJSの式で書ける
- **テンプレート**：HTMLベースの構文に<code>v-for</code>などを足す。見た目の形をHTMLのまま読める

<div class="source"><lucide-link /><a href="https://ja.react.dev/learn/writing-markup-with-jsx" target="_blank">React：JSXでマークアップを記述する</a>・<a href="https://ja.vuejs.org/guide/essentials/template-syntax" target="_blank">Vue.js：テンプレート構文</a></div>

---

# リアクティビティ：stateとref

<div class="sub">状態が変わったときの、画面の更新の仕組みが違う</div>

<div class="cols">
<div class="card">
<div class="col-h">React</div>

```tsx
// ① 新しい配列を作ってsetする（pushでは変わらない）
setRecords([...records, newRecord])

// ② 依存には、比べられる値を入れる
useEffect(() => {
  load({ month })
}, [month])
// ✗ よくある間違い：[{ month }]は毎回別物になる
```

</div>
<div class="card">
<div class="col-h">Vue</div>

```ts
// ① 書き換えれば、そのまま画面に反映される
records.value.push(newRecord)

// ② monthが変わったときに動く
watch(month, () => load({ month: month.value }), {
  immediate: true, // useEffectと同じく初回も動かす
})
```

</div>
</div>

- **①**：Reactは新しい値を作ってsetし直す。Vueは書き換えを自動で検出する
- **②**：Reactは描画のたびに関数が動き直すので、依存の指定に気を配る。Vueのsetupは一度だけ動く

<div class="note">React Compiler（2025.10に安定版）を使うと、手で書いていたメモ化の多くは自動になる</div>

<div class="source"><lucide-link /><a href="https://ja.react.dev/learn/updating-objects-in-state" target="_blank">React：state内のオブジェクトの更新</a>・<a href="https://ja.react.dev/learn/removing-effect-dependencies" target="_blank">React：エフェクトから依存値を取り除く</a>・<a href="https://ja.vuejs.org/guide/essentials/reactivity-fundamentals" target="_blank">Vue.js：リアクティビティーの基礎</a>・<a href="https://react.dev/blog/2025/10/07/react-compiler-1" target="_blank">React Blog：React Compiler v1.0</a></div>

---
layout: center
class: sub-divider
---

<div class="kicker">01-2</div>

# Next.jsとNuxtを比べる

<div class="sub">画面とAPIをまとめる部分。左にNext.js、右にNuxtを並べる</div>

1. **フォルダ構成**：どこに何を置くか
2. **import**：部品や関数をどう読み込むか
3. **データとAPI**：画面からサーバーの処理をどう呼ぶか
4. **Next.jsの方が強いところ**

---

# フォルダ構成

<div class="sub">URLの決まり方はNext.jsと同じ。違いはその先で、Nuxtは部品や関数の置き場所まで決まっている</div>

<div class="cols">
<div>
<div class="col-h">Next.js（App Router）</div>

<pre class="tree"><span class="t">app/</span>
  <span class="p">page.tsx</span>            <span class="muted">/</span>
  <span class="p">users/page.tsx</span>      <span class="muted">/users</span>
  <span class="p">api/users/route.ts</span>  <span class="muted">/api/users</span>
<span class="muted">部品や関数の置き場所は自由</span>
<span class="muted">（チームで決める）</span></pre>

</div>
<div>
<div class="col-h">Nuxt</div>

<pre class="tree"><span class="t">app/</span>
  <span class="p">pages/index.vue</span>     <span class="muted">/</span>
  <span class="p">pages/users.vue</span>     <span class="muted">/users</span>
  <span class="v">components/</span>         <span class="muted">部品（import不要）</span>
  <span class="v">composables/</span>        <span class="muted">処理（import不要）</span>
<span class="t">server/</span>
  <span class="p">api/users.ts</span>        <span class="muted">/api/users</span></pre>

</div>
</div>

<div class="punch">違い：Nuxtでは置き場所で悩まず、誰が書いても同じ構成になる</div>

<div class="source"><lucide-link /><a href="https://nextjs.org/docs/app/getting-started/project-structure" target="_blank">Next.js：Project Structure</a>・<a href="https://nuxt.com/docs/4.x/directory-structure" target="_blank">Nuxt：Directory Structure</a></div>

---

# import

<div class="sub">Nuxtでは、決まった場所に置いたものをimportなしで使える（自動インポート）</div>

<div class="cols">
<div class="card">
<div class="col-h">Next.js</div>

```tsx
'use client'
import { useState } from 'react'
import { RecordTable } from '@/ui/RecordTable'
import { useRecords } from '@/hooks/useRecords'

export default function Page() {
  const [month, setMonth] = useState('2026-10')
  // ...
}
```

</div>
<div class="card">
<div class="col-h">Nuxt</div>

```vue
<script setup lang="ts">
// import文がない
const month = ref('2026-10')
const { data } = useRecords(month)
</script>

<template>
  <RecordTable :records="data ?? []" />
</template>
```

</div>
</div>

- **対象**：<code>ref</code>などVueの関数、<code>useFetch</code>などNuxtの関数、自作のcomponentsとcomposables
- **composable**：状態と処理をまとめた関数。Reactのカスタムフックに近く、<code>app/composables/</code>に置く
- **出どころ**：エディタの定義ジャンプで追える（型の定義はNuxtが自動で作る）

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/guide/concepts/auto-imports" target="_blank">Nuxt：Auto-imports</a>・<a href="https://nuxt.com/docs/4.x/directory-structure/app/composables" target="_blank">Nuxt：composables/</a></div>

---

# データとAPI

<div class="sub">Next.jsはServer Componentからデータを直接読める。NuxtはAPIを置き、画面から呼ぶ</div>

<div class="cols">
<div class="card">
<div class="col-h">Next.js</div>

```tsx
// app/users/page.tsx（Server Component）
export default async function Page() {
  // サーバーで動くので、データを直接読める
  const users = await db.user.findMany()
  return <UserList users={users} />
}
```

</div>
<div class="card">
<div class="col-h">Nuxt</div>

```ts
// server/api/users.ts
export default defineEventHandler(() =>
  db.user.findMany(),
)

// app/pages/users.vue
const { data: users } =
  await useFetch('/api/users')
```

</div>
</div>

- **Next.js**：APIを作らずに書ける。外から呼ぶAPIは、Route Handler（<code>route.ts</code>で書くAPI）で作る
- **Nuxt**：<code>users.ts</code>が<code>/api/users</code>になる。<code>users</code>の型もAPIの戻り値から自動で付く

<div class="punch">違い：Nuxtは画面とAPIの境目が<code>server/api/</code>で決まり、型も自動でつながる</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/directory-structure/server" target="_blank">Nuxt：server/</a>・<a href="https://nuxt.com/docs/4.x/getting-started/data-fetching" target="_blank">Nuxt：Data Fetching</a>・<a href="https://nextjs.org/docs/app/getting-started/fetching-data" target="_blank">Next.js：Fetching Data</a></div>

---
class: roomy
---

# Next.jsの方が強いところ

<div class="sub">利用者の多さとReactの資産は、Next.jsならではの強み</div>

- **Server Components**：Reactの中心にある仕組み。Nuxtにも<code>.server.vue</code>はあるが、実験的な位置づけ
- **Server Functions**：フォームの送信などを、APIのURLを作らずに関数として呼べる
- **Reactのエコシステム**：UI部品やSaaSのSDKは、React向けが先に出ることが多い
- **情報と人の多さ**：困ったときの答えや、経験のある人が見つかりやすい
- **React Native**：モバイルアプリと、知識やコードを共有しやすい

<div class="source"><lucide-link /><a href="https://nextjs.org/docs/app/getting-started/server-and-client-components" target="_blank">Next.js：Server and Client Components</a>・<a href="https://nextjs.org/docs/app/getting-started/mutating-data" target="_blank">Next.js：Mutating Data</a>・<a href="https://nuxt.com/docs/4.x/directory-structure/app/components" target="_blank">Nuxt：components/</a></div>

---
routeAlias: what-is-point
style: "--accent: var(--purple)"
---

<div class="kicker">01のまとめ</div>

# Next.jsとの違いは、書き方と置き場所の決まり

<div class="sub">画面とAPIを1つのアプリで扱う点は同じ。違うのは画面の書き方と、どこに何を置くかの決まり</div>

| | Next.js | Nuxt |
|---|---|---|
| 画面とAPIを1つのアプリで | できる | できる（同じ） |
| URLとページ | ファイルで決まる | ファイルで決まる（同じ） |
| 画面の書き方 | JSX | HTMLベースのテンプレート |
| 部品・処理の置き場所 | チームで決める | <code>components/</code>、<code>composables/</code> |
| import | 書く | 自動インポート |
| データの取り方 | Server Componentsで取る（ブラウザ側はライブラリを選ぶ） | <code>useFetch</code>と<code>server/api/</code> |

<style>
table { font-size: 0.88rem; }
th, td { padding-top: 0.35rem !important; padding-bottom: 0.35rem !important; }
</style>
