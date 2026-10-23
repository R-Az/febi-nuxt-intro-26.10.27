---
layout: section
routeAlias: when-to-use
style: "--accent: var(--orange)"
---

<div class="section-num">04</div>

# 向いている場面

<div class="section-sub">PoCや社内ツールに限らず選択肢に入る。慎重に考えたい場面もある</div>

---

# 私の考え：どちらを選んでもいい <span class="badge" style="--c: var(--orange)">私見</span>

<div class="sub">NuxtでもNext.jsでも、選んで困ることは少ない</div>

<div class="opinion">
<div class="card">
<div class="col-h">① 速度は決め手になりにくい</div>

- 差はReactかVueかより、作り方（画像や外部スクリプト）で出る
- 端末の性能は上がり続けている

</div>
<lucide-plus class="arrow" />
<div class="card">
<div class="col-h">② 採用も気にしなくていい</div>

- 利用者はNext.jsが約30倍。それでもNuxtは週に約138万回使われている
- AIを使う開発者は84%。書き手の数の差は効きにくくなった

</div>
<lucide-arrow-right class="arrow" />
<div class="card">
<div class="col-h">③ なら、合う方を選べばいい</div>

- どちらも大きなサービスで使われている
- Nuxtも2025.07からはVercelのもとで、MITのまま開発が続く

</div>
</div>

<div class="punch">そのうえで私は、Nuxtの「選ばなくていい」ところが好き</div>

<div class="note">Lintの設定やUIライブラリは、作りたいプロダクトの本質ではない。それでも運用と保守を考えると、毎回悩む。Nuxtはそこが決まっていて、悩まずに済む</div>

<div class="source"><lucide-link /><a href="https://www.npmjs.com/package/nuxt" target="_blank">npm：週間ダウンロード（2026.10.12〜18、next 約4,107万・nuxt 約138万）</a>・<a href="https://survey.stackoverflow.co/2025/ai" target="_blank">Stack Overflow Developer Survey 2025</a>・<a href="https://vercel.com/blog/nuxtlabs-joins-vercel" target="_blank">Vercel Blog</a>・<a href="https://nuxt.com/showcase" target="_blank">Nuxt：Showcase</a></div>

<style>
.opinion { display: flex; align-items: stretch; gap: 0.4rem; }
.opinion .card { flex: 1; font-size: 0.85rem; }
.opinion .arrow { align-self: center; flex: none; color: var(--orange); font-size: 1.4rem; }
.opinion ul { padding-left: 1rem; }
</style>

---
routeAlias: when-to-use-point
style: "--accent: var(--orange)"
---

<div class="kicker">04のまとめ</div>

# Nuxtが向いている場面、向かない場面

<div class="sub">画面とAPIを素早く作りたいなら、規模を問わず選択肢に入る</div>

<div class="cols">
<div class="card lit">
<div class="col-h ok"><lucide-check /> 向いている</div>

- **PoC・検証**：まず動く形を早く見せたい
- **社内ツール・管理画面**：テンプレートとUI部品で足りる
- **少人数の業務アプリ**：構成や道具を決める手間をかけたくない
- **Vueに慣れたチーム**：今の知識がそのまま使える

</div>
<div class="card">
<div class="col-h ng"><lucide-x /> 慎重に考えたい</div>

- **React向けにしかないもの**：使いたいSDKや部品がReact向けにしかない
- **React Nativeとの共有**：モバイルアプリとコードを共有したい
- **React前提の資産**：既存のコードや体制がReactでそろっている
- **学び直す時間がない**：Reactに慣れたチームで、Vueを覚える余裕がない

</div>
</div>
