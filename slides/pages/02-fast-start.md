---
layout: section
routeAlias: fast-start
style: "--accent: var(--green)"
---

<div class="section-num">02</div>

# テンプレートとNuxt UI

<div class="section-sub">1コマンドで、管理画面のある状態から始まる</div>

---
class: roomy
---

# テンプレートから1コマンドで始める

<div class="sub">テンプレートを選べば、画面の作りから考えなくていい</div>

```bash
# 何も入っていない状態から
pnpm create nuxt@latest my-app

# 管理画面のテンプレートから
pnpm create nuxt@latest my-app -t ui/dashboard
```

<div class="card">
<div class="col-h">Nuxt UIのテンプレート</div>

Starter、Dashboard、SaaS、Landing、Docs、Chat、Portfolio、Changelog、Editor、Calendar

</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/getting-started/installation" target="_blank">Nuxt：Installation</a>・<a href="https://ui.nuxt.com/docs/getting-started/installation/nuxt" target="_blank">Nuxt UI：Installation</a></div>

---

# ライブデモ：管理画面のテンプレートから立ち上げる

<div class="sub">コマンド2つで、この画面が動き出す</div>

<div class="cols middle">
<div>

<div class="where"><lucide-terminal /> ターミナルで実行</div>

```bash {1-3|4}
pnpm create nuxt@latest demo \
  -t ui/dashboard --packageManager=pnpm \
  --no-gitInit --no-modules
cd demo && pnpm dev
```

<div class="note">一覧、フォーム、グラフ、ダークモードの切り替えまで、最初から動いている</div>

</div>
<div class="fit shot">

![管理画面のテンプレートを起動した画面](/demo-dashboard.jpg)

</div>
</div>

<div class="source"><lucide-link /><a href="https://ui.nuxt.com/templates" target="_blank">Nuxt UI：Templates</a>・<a href="https://nuxt.com/docs/4.x/api/commands/init" target="_blank">Nuxt：create nuxt</a></div>

<style>
.shot img { width: 26rem; border: 1px solid var(--border); border-radius: 0.5rem; }
</style>

---
class: roomy
---

# Nuxt UI：UIライブラリで悩まない

<div class="sub">公式のUIライブラリがあるので、まずはこれを使う</div>

<div class="cols middle">
<div>

```vue
<template>
  <UButton label="出勤" @click="punchIn" />
  <UTable :data="records" />
</template>
```

<div class="note">部品もimportなしで使える</div>
</div>
<div>

- **部品**：ボタン、フォーム、テーブル、モーダルなど100以上
- **選ぶ手間**：Vueにも候補は多いが、公式があるので最初の1つで迷いにくい
- **テンプレート**：さっきの管理画面も、この部品で作られている
- **費用**：v4で有料だったProを統合し、すべて無料で使える

</div>
</div>

<div class="source"><lucide-link /><a href="https://ui.nuxt.com" target="_blank">Nuxt UI</a>・<a href="https://nuxt.com/blog/nuxt-ui-v4" target="_blank">Nuxt Blog：Nuxt UI v4</a></div>

---

# 足りない機能は、モジュールで足す

<div class="sub">コマンド1つで、インストールと設定の追記まで終わる</div>

<div class="cols middle">
<div>

```bash
pnpm nuxt module add eslint
```

<div class="note">実行すると、<code>nuxt.config.ts</code>はこうなる（自分では書かない）</div>

```ts {3}
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'], // ← 追記された
})
```

</div>
<div>

- **手順**：どのモジュールでも同じなので、入れ方で悩まない
- **例**：認証、多言語、テスト、画像の最適化など
- **使い方**：入れた後は、ふつうのライブラリと同じくドキュメントに沿って使う

</div>
</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/api/commands/module" target="_blank">Nuxt：nuxt module</a>・<a href="https://nuxt.com/modules" target="_blank">Nuxt：Modules</a></div>

---
routeAlias: fast-start-point
class: roomy
style: "--accent: var(--green)"
---

<div class="kicker">02のまとめ</div>

# テンプレートで始めて、モジュールで足す

<div class="sub">UIも機能の足し方も決まっていて、選ぶところが少ない</div>

<div class="cols">
<div class="card">
<div class="col-h">始める</div>

<code>pnpm create nuxt -t ui/dashboard</code>

管理画面のある状態から始まる。<br>部品は公式のNuxt UIがそろえている

</div>
<div class="card">
<div class="col-h">足す</div>

<code>pnpm nuxt module add &lt;名前&gt;</code>

どの機能も同じ手順で足せる。<br>書くのはアプリ固有の部分に絞れる

</div>
</div>

<style>
.card code { white-space: nowrap; font-size: 0.8em; }
</style>
