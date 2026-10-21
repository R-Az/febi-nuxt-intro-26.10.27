---
layout: section
routeAlias: fast-start
style: "--accent: var(--green)"
---

<div class="section-num">02</div>

# テンプレートとモジュール

<div class="section-sub">テンプレートから始めて、要るものはモジュールで足す</div>

---
class: roomy
---

# テンプレートから1コマンドで始める

<div class="sub">テンプレートを指定すると、画面ができた状態から始まる</div>

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

<div class="note">テンプレートの<code>nuxt.config.ts</code>には、<code>@nuxt/ui</code>・<code>@nuxt/eslint</code>・<code>@vueuse/nuxt</code>のモジュールが入っている</div>

</div>
<div class="fit shot">

![管理画面のテンプレートを起動した画面](/demo-dashboard.jpg)

</div>
</div>

<div class="source"><lucide-link /><a href="https://ui.nuxt.com/templates" target="_blank">Nuxt UI：Templates</a>・<a href="https://nuxt.com/docs/4.x/api/commands/init" target="_blank">Nuxt：nuxt init</a></div>

<style>
.shot img { width: 26rem; border: 1px solid var(--border); border-radius: 0.5rem; }
</style>

---
class: roomy
---

# Nuxt UI：公式のUI部品

<div class="sub">業務アプリでよく使う部品が、最初からそろっている</div>

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
- **テンプレート**：さっきのテンプレートも、この部品で作られている
- **費用**：v4で有料版（Pro）を統合し、無料のOSSになった

</div>
</div>

<div class="source"><lucide-link /><a href="https://ui.nuxt.com" target="_blank">Nuxt UI</a>・<a href="https://nuxt.com/blog/nuxt-ui-v4" target="_blank">Nuxt Blog：Nuxt UI v4</a></div>

---

# モジュールの入れ方

<div class="sub">コマンド1つで、インストールと設定の追記まで終わる</div>

<div class="cols middle">
<div>

```bash
pnpm nuxt module add auth-utils
```

<div class="note">実行すると、<code>nuxt.config.ts</code>はこうなる（自分では書かない）</div>

```ts {3}
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-auth-utils'], // ← 追記された
})
```

</div>
<div>

- **インストール**：パッケージを依存関係に追加する
- **設定**：`nuxt.config.ts`の`modules`に自動で書き足す
- **手順**：どのモジュールでも同じ

</div>
</div>

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/api/commands/module" target="_blank">Nuxt：nuxt module</a></div>

---

# モジュールを足せば、すぐ使える

<div class="sub">足すと、部品・composable・APIがそのまま使える状態になる</div>

<div class="flow">
  <div class="step">pnpm nuxt module add<small>1コマンド</small></div>
  <lucide-arrow-right class="arrow" />
  <div class="step lit">モジュールが登録する<small>部品、composable、サーバーのAPI、ビルドの設定</small></div>
  <lucide-arrow-right class="arrow" />
  <div class="step">すぐ使える<small>ほとんど実装しなくていい</small></div>
</div>

例：<code>nuxt-auth-utils</code>を足すと

- **画面**：`useUserSession()`で、ログイン中のユーザーを取れる
- **サーバー**：`setUserSession()`や`requireUserSession()`で、セッションを扱える
- **パスワード**：`hashPassword()`と`verifyPassword()`で、ハッシュ化と照合ができる
- **パスキー**：`webAuthn: true`を足すと対応する（保存先のDBは自分で用意する）

<div class="source"><lucide-link /><a href="https://nuxt.com/docs/4.x/guide/modules" target="_blank">Nuxt：Modules</a>・<a href="https://github.com/atinux/nuxt-auth-utils" target="_blank">GitHub：nuxt-auth-utils</a></div>

---

# TypeScriptの設定を、モジュールに任せる

<div class="sub">TypeScriptのプロジェクトは設定ファイルが増えやすい。その一部をモジュールが引き受ける</div>

<div class="cols">
<div class="card">
<div class="col-h">ESLint：@nuxt/eslint</div>

```js
// eslint.config.mjs（module addで自動で作られる）
import withNuxt from './.nuxt/eslint.config.mjs'
export default withNuxt()
```

使っているモジュールやフォルダに合わせた設定を、モジュールが生成する。自分のルールは`withNuxt()`の引数に足す

</div>
<div class="card">
<div class="col-h">計測タグ：@nuxt/scripts</div>

```ts
// nuxt.config.ts
scripts: {
  registry: {
    googleAnalytics: { id: 'G-XXXXXXXX' },
  },
},
```

既定では、画面の表示が終わってブラウザの処理が落ち着いたときに読み込む。同意や操作をきっかけにもできる

</div>
</div>

<div class="source"><lucide-link /><a href="https://eslint.nuxt.com/packages/module" target="_blank">Nuxt ESLint：Module</a>・<a href="https://scripts.nuxt.com/docs/getting-started" target="_blank">Nuxt Scripts：Getting Started</a>・<a href="https://scripts.nuxt.com/scripts/google-analytics" target="_blank">Nuxt Scripts：Google Analytics</a></div>

---

# ライブデモ：Lintも最初から使える

<div class="sub">テンプレートに@nuxt/eslintが入っているので、設定を書かずにTypeScriptとVueのルールが効く</div>

<div class="cols">
<div>

<div class="where"><lucide-file-code /> app/pages/bad.vue（わざと問題を入れる）</div>

```vue
<script setup lang="ts">
const unused = 1
const count: any = ref(0)
</script>

<template>
  <ul>
    <li v-for="n in count">{{ n }}</li>
  </ul>
</template>
```

</div>
<div>

<div class="where"><lucide-terminal /> <code>pnpm lint</code>の結果（ルール名で抜粋）</div>

```text
2:7   @typescript-eslint/no-unused-vars
3:14  @typescript-eslint/no-explicit-any
8:5   vue/require-v-for-key
8:28  vue/singleline-html-element-content-newline
```

<div class="note">自分のプロジェクトに足すときは<code>pnpm nuxt module add eslint</code>の1コマンド。<code>eslint.config.mjs</code>も作られる</div>

</div>
</div>

<div class="source"><lucide-link /><a href="https://eslint.nuxt.com/packages/module" target="_blank">Nuxt ESLint：Module</a></div>

---

# 業務アプリでよく使うモジュール

<div class="sub">モジュール一覧は、どこで管理されているかで3つに分かれている</div>

| 区分 | モジュール | やりたいこと | できること |
|---|---|---|---|
| 公式 | `@nuxt/ui` | 画面の部品 | フォーム、テーブル、モーダルなど |
| 公式 | `@nuxt/eslint` | コードの検査 | プロジェクトに合わせたESLintの設定 |
| 公式 | `@nuxt/test-utils` | テスト | Nuxtの機能を使ったテスト |
| コミュニティ | `@nuxtjs/i18n` | 多言語 | 画面の文言の切り替え |
| 3rd-party | `nuxt-auth-utils` | ログイン | セッション、OAuth、パスキー |
| 3rd-party | `@pinia/nuxt` | 状態の共有 | 画面をまたぐデータの管理 |

<div class="note"><b>公式</b>：Nuxt本体と同じ<code>nuxt</code> organization ／ <b>コミュニティ</b>：<code>nuxt-modules</code> organizationでコミュニティが管理 ／ <b>3rd-party</b>：企業や個人のリポジトリ</div>

<style>
th, td { padding-top: 0.35rem !important; padding-bottom: 0.35rem !important; }
</style>

<div class="source"><lucide-link /><a href="https://nuxt.com/modules" target="_blank">Nuxt：Modules</a>・<a href="https://github.com/nuxt/modules" target="_blank">GitHub：nuxt/modules</a>・<a href="https://github.com/nuxt-modules" target="_blank">GitHub：nuxt-modules</a></div>

---

# Nuxt 4で使えるモジュールは277件

<div class="sub">一覧の433件のうち、Nuxt 4への対応を宣言し、2025.07以降にnpmで更新があったもの</div>

<div class="bars">
<div class="bar"><span class="label">Libraries</span><span class="fill" style="--w: 100%"></span><span class="n">55</span></div>
<div class="bar"><span class="label">UI</span><span class="fill" style="--w: 87%"></span><span class="n">48</span></div>
<div class="bar"><span class="label">Extensions</span><span class="fill" style="--w: 53%"></span><span class="n">29</span></div>
<div class="bar"><span class="label">Security</span><span class="fill" style="--w: 40%"></span><span class="n">22</span></div>
<div class="bar"><span class="label">Devtools</span><span class="fill" style="--w: 38%"></span><span class="n">21</span></div>
<div class="bar"><span class="label">CMS</span><span class="fill" style="--w: 29%"></span><span class="n">16</span></div>
<div class="bar"><span class="label">Database</span><span class="fill" style="--w: 24%"></span><span class="n">13</span></div>
<div class="bar"><span class="label">Request</span><span class="fill" style="--w: 24%"></span><span class="n">13</span></div>
</div>

<div class="note">ほかに11分類で60件。対象は、npmで非推奨になっておらず、Nuxt 4.0.0の公開（2025.07.15）以降にnpmの情報が更新されたもの</div>

<div class="source"><lucide-link /><a href="https://github.com/nuxt/modules" target="_blank">@nuxt/modules 0.6.0-8d66eeとnpmのデータを集計（2026.10.15時点）</a></div>

---

# 定期処理も同じプロジェクトに書ける

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
    scheduledTasks: { '0 0 * * *': ['check-missing'] },
  },
})
```

</div>
</div>

- **実験的な機能**：有効にするには<code>experimental.tasks</code>の設定が要る
- **デプロイ先が限られる**：定期実行できるのは、Node.jsのサーバーやCloudflareなど

<div class="source"><lucide-link /><a href="https://v2.nitro.build/guide/tasks" target="_blank">Nitro：Tasks</a></div>

---
routeAlias: fast-start-point
class: roomy
---

# テンプレートで始めて、モジュールで足す

<div class="sub">立ち上げの手順と、機能の足し方が決まっている</div>

<div class="cols">
<div class="card">
<div class="col-h">始める</div>

<code>pnpm create nuxt -t ui/dashboard</code>で、画面のある状態から始まる。部品はNuxt UIがそろえている

</div>
<div class="card lit">
<div class="col-h">足す</div>

<code>pnpm nuxt module add</code>で、認証もLintも計測も同じ手順で足せる。足せば、ほとんど実装せずに機能が使える

</div>
</div>

<div class="note">環境変数（例：本番の<code>NUXT_SESSION_PASSWORD</code>）や見た目の設定など、自分で書く設定もある</div>
