---
theme: dracula
title: NuxtでWebアプリケーションを楽に立ち上げる
transition: slide-left
htmlAttrs:
  lang: ja
---

# 🚀 NuxtでWebアプリケーションを楽に立ち上げる

PoCや社内ツールを、すぐ動く形にする

<div class="foot">Ryoga Azuma・2026.10.27</div>

---

# 自己紹介

<div class="cols profile">
<div class="fit who">

![東 遼河](/profile.webp)

<div class="name">東 遼河</div>
<div class="kana">あずま りょうが / Ryoga Azuma</div>

<div class="meta"><b>所属</b>Engineering Pros. 3（EP3）</div>
<div class="meta"><b>職種</b>Server-side Engineer</div>

</div>
<div class="about">

- **経歴**：新卒でSESに入り、Bitkey、つながる薬局と移ってきました。副業でオンライン診療サービスも手伝っています
- **フルスタック**：フロントもバックも書きます。TypeScriptメインです

| 関わってきたプロダクト | 技術 |
|---|---|
| 法人向けスマートロックの管理画面（Bitkey） | React、Express |
| つながる薬局 | Nuxt、Go |
| オンライン診療サービス（副業） | Next.js |

<div class="note">インフラはどれもGCPです。IoT機器のログ解析や、デザイナーと一緒にUI/UXを良くする仕事もしてきました</div>

</div>
</div>

<style>
.profile { align-items: center; gap: 2rem; }
.profile .who { width: 15rem; text-align: center; }
.profile .who img { width: 11rem; height: 11rem; border-radius: 50%; object-fit: cover; margin: 0 auto 0.8rem; }
.profile .name { font-size: 1.6rem; font-weight: 700; }
.profile .kana { font-size: 0.8rem; color: var(--comment); margin-bottom: 0.8rem; }
.profile .meta { font-size: 0.85rem; }
.profile .meta b { color: var(--comment); font-weight: 400; margin-right: 0.6rem; }
.profile .about { font-size: 1.02rem; line-height: 1.7; }
</style>

---

# アジェンダ

<div class="agenda">
<Link to="what-is" class="agenda-item"><span class="num">01</span> Nuxtの基本<small>ReactとNext.jsと比べて見る</small></Link>
<Link to="fast-start" class="agenda-item" style="--accent: var(--green)"><span class="num">02</span> テンプレートとNuxt UI<small>1コマンドで、管理画面から始める</small></Link>
<Link to="ai-experiment" class="agenda-item" style="--accent: var(--cyan)"><span class="num">03</span> AIに作らせて比べた<small>NuxtとNext.jsで勤怠管理アプリ</small></Link>
<Link to="when-to-use" class="agenda-item" style="--accent: var(--orange)"><span class="num">04</span> 向いている場面<small>向く場面と、慎重に考えたい場面</small></Link>
</div>

---
src: ./pages/01-what-is.md
---

---
src: ./pages/02-fast-start.md
---

---
src: ./pages/03-ai-experiment.md
---

---
src: ./pages/04-when-to-use.md
---

---

# 振り返り

<div class="agenda">
<Link to="what-is-point" class="agenda-item"><span class="num">01</span> Nuxtの基本<small>Next.jsとの違いは、書き方と置き場所の決まり</small></Link>
<Link to="fast-start-point" class="agenda-item" style="--accent: var(--green)"><span class="num">02</span> テンプレートとNuxt UI<small>テンプレートで始めて、要るものはモジュールで足す</small></Link>
<Link to="ai-experiment-point" class="agenda-item" style="--accent: var(--cyan)"><span class="num">03</span> AIに作らせて比べた<small>作るときは書く量が少なく、足す手間はほぼ同じだった</small></Link>
<Link to="when-to-use-point" class="agenda-item" style="--accent: var(--orange)"><span class="num">04</span> 向いている場面<small>PoC、社内ツール、少人数の業務アプリに向いている</small></Link>
</div>

---

# まとめ

<div class="sub">Nuxtは決まっていることが多く、悩まずにWebアプリを立ち上げられる</div>

<div class="summary">
<div class="card"><lucide-plug class="ic" /><div class="col-h">型がつながる</div>APIは<code>server/api/</code>に置き、型は画面まで自動で付く</div>
<div class="card"><lucide-folder-tree class="ic" /><div class="col-h">決まっている</div>置き場所、import、UI、機能の足し方</div>
<div class="card"><lucide-layout-dashboard class="ic" /><div class="col-h">すぐ始まる</div>テンプレートとNuxt UIで管理画面から</div>
<div class="card"><lucide-bot class="ic" /><div class="col-h">AIでも少なく</div>作るときの出力トークンは約0.8倍、importは約4分の1</div>
</div>

<div class="note">PoCや社内ツールに向く。React前提の資産やチームがあるなら、Next.jsも十分よい選択</div>

<style>
.summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.8rem; margin-top: 1.5rem; }
.summary .card { text-align: center; font-size: 0.85rem; }
.summary .ic { font-size: 2rem; color: var(--purple); margin: 0.3rem auto 0.5rem; display: block; }
</style>

---
layout: center
class: text-center
---

# まずは1つ、立ち上げてみる

<div class="cta">次にPoCを作るときは、選択肢の1つとして<code>pnpm create nuxt@latest</code>を試してみてください</div>

<div class="pills">
<a class="pill" href="https://nuxt.com/docs" target="_blank"><lucide-book-open />Nuxtのドキュメント</a>
<a class="pill" href="https://ui.nuxt.com/templates" target="_blank"><lucide-layout-template />Nuxt UIのテンプレート</a>
<a class="pill" href="https://nuxt.com/modules" target="_blank"><lucide-blocks />Nuxtのモジュール一覧</a>
</div>
