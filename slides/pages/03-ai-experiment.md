---
layout: section
routeAlias: ai-experiment
style: "--accent: var(--cyan)"
---

<div class="section-num">03</div>

# AIに作らせて比べた

<div class="section-sub">同じ指示で、NuxtとNext.jsに勤怠管理アプリを作らせる</div>

---

# 確かめたかったこと

<div class="ask">Nuxtの決まりごととモジュールは、AIに作らせるときにも手間を減らすのか？</div>

<div class="cols">
<div class="card">
<div class="col-h">予想1</div>

自動インポートと決まりごとの分、出力トークンとコードが少なくなる

</div>
<div class="card">
<div class="col-h">予想2</div>

用意された仕組みを使うので、手戻りや追加の依存が少なくなる

</div>
<div class="card">
<div class="col-h">予想3（反対の予想）</div>

学習データが多い分、Next.jsの方がエラーや介入が少なくなる

</div>
</div>

<div class="note">予想は検証の計画に書いておき、結果を見てから答え合わせをする</div>

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/docs/context/03_experiment-plan.md" target="_blank">GitHub：検証の計画</a></div>

---

# 何をどう比べたか

<div class="sub">同じAI・同じ指示文で、小さな会社向けの勤怠管理アプリを作らせた</div>

<div class="flow">
  <div class="step">同じ指示文<small>フレームワーク名だけ変える</small></div>
  <lucide-arrow-right class="arrow" />
  <div class="step lit">① 作る<small>ゼロからアプリを作る</small></div>
  <lucide-arrow-right class="arrow" />
  <div class="step lit">② 足す<small>UI部品・見た目・Lint・GA（Google Analytics）を足す</small></div>
  <lucide-arrow-right class="arrow" />
  <div class="step">判定<small>別のAIがテストと画面の操作で確かめる</small></div>
</div>

- **アプリ**：従業員10〜30人の会社の勤怠管理。打刻、月次一覧、CSV出力、権限、毎日0時の定期処理など
- **受け入れ条件**：①は12件、②は6件。ライブラリ名は指示文に書かない
- **条件**：Claude Code（claude-opus-5-5）、毎回新しいセッション。止まったら決まった文面だけ返す
- **回数**：NuxtとNext.jsで、①と②を2回ずつ（計8回）

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/tree/master/experiment" target="_blank">GitHub：検証の手順と指示文（2026.10.19〜20に実施）</a>・<a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/results/experiment/conditions.md" target="_blank">実施した条件</a></div>

---

# ① 作る：Nuxtの方が書く量が少なかった

<div class="sub">各2回の平均（モデルは1種類）。どちらも人の介入なしで、受け入れ条件12件をすべて満たした</div>

<div class="cols pairs">
<div>
<div class="col-h">出力トークン<span class="ratio">Nuxtは約0.8倍</span></div>
<div class="bars">
<div class="bar"><span class="label">Nuxt</span><span class="fill" style="--w: 78%"></span><span class="n">74,867</span></div>
<div class="bar"><span class="label">Next.js</span><span class="fill" style="--w: 100%; --c: var(--pink)"></span><span class="n">95,558</span></div>
</div>
<div class="col-h">推定コスト（USD）<span class="ratio">Nuxtは約0.65倍</span></div>
<div class="bars">
<div class="bar"><span class="label">Nuxt</span><span class="fill" style="--w: 65%"></span><span class="n">3.92</span></div>
<div class="bar"><span class="label">Next.js</span><span class="fill" style="--w: 100%; --c: var(--pink)"></span><span class="n">5.99</span></div>
</div>
</div>
<div>
<div class="col-h">所要時間（分）<span class="ratio">Nuxtは約0.8倍</span></div>
<div class="bars">
<div class="bar"><span class="label">Nuxt</span><span class="fill" style="--w: 77%"></span><span class="n">12.5</span></div>
<div class="bar"><span class="label">Next.js</span><span class="fill" style="--w: 100%; --c: var(--pink)"></span><span class="n">16.3</span></div>
</div>
<div class="col-h">importの行数<span class="ratio">Nuxtは約4分の1</span></div>
<div class="bars">
<div class="bar"><span class="label">Nuxt</span><span class="fill" style="--w: 26%"></span><span class="n">45</span></div>
<div class="bar"><span class="label">Next.js</span><span class="fill" style="--w: 100%; --c: var(--pink)"></span><span class="n">170</span></div>
</div>
</div>
</div>

<div class="note">importの差が特に大きい。自動インポートの分に、認証をモジュールに任せた分が加わった</div>

<div v-click class="punch">書く量もコストも、Nuxtの方が少なく済みました</div>

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/results/experiment/summary.md" target="_blank">GitHub：results/experiment/summary.md</a></div>

<style>
.pairs .col-h { margin-top: 0.6rem; margin-bottom: 0; }
.pairs .bar { grid-template-columns: 4rem 1fr 3.5rem; font-size: 0.85rem; }
.pairs .bar .fill { height: 0.9rem; }
</style>

---

# AIも用意された仕組みを選んでいた

<div class="sub">同じ要件に、Nuxtはモジュールと組み込みの機能で、Next.jsは自前のコードで応えた</div>

| 要件 | Nuxt（2回とも） | Next.js（2回とも） |
|---|---|---|
| ログインとセッション | `nuxt-auth-utils`モジュール | Cookieの署名とハッシュ化を自前で実装 |
| 毎日0時の定期処理 | 組み込みのNitro Tasks（実験的な機能） | 自前のタイマー（1回目はVercelのcron設定も追加） |
| 単体テスト | Vitest | Vitest |

<div v-click class="punch">今回の2回では、AIも決まった置き場所と定番のモジュールをそのまま使いました</div>

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/tree/master/experiment" target="_blank">GitHub：作られたアプリのコード（experiment/nuxt、experiment/next）</a>・<a href="https://v2.nitro.build/guide/tasks" target="_blank">Nitro：Tasks</a></div>

---

# ② 足す：手間はほぼ同じだった

<div class="sub">UI部品・見た目・Lint・GAを足させた。どちらも①の12件と②の6件、計18件をすべて満たした</div>

<div class="cols pairs">
<div>
<div class="col-h">出力トークン<span class="ratio">ほぼ同じ</span></div>
<div class="bars">
<div class="bar"><span class="label">Nuxt</span><span class="fill" style="--w: 96%"></span><span class="n">66,665</span></div>
<div class="bar"><span class="label">Next.js</span><span class="fill" style="--w: 100%; --c: var(--pink)"></span><span class="n">69,409</span></div>
</div>
<div class="col-h">推定コスト（USD）<span class="ratio">ほぼ同じ</span></div>
<div class="bars">
<div class="bar"><span class="label">Nuxt</span><span class="fill" style="--w: 100%"></span><span class="n">5.94</span></div>
<div class="bar"><span class="label">Next.js</span><span class="fill" style="--w: 97%; --c: var(--pink)"></span><span class="n">5.76</span></div>
</div>
</div>
<div>
<div class="col-h">所要時間（分）<span class="ratio">ほぼ同じ</span></div>
<div class="bars">
<div class="bar"><span class="label">Nuxt</span><span class="fill" style="--w: 100%"></span><span class="n">13.3</span></div>
<div class="bar"><span class="label">Next.js</span><span class="fill" style="--w: 95%; --c: var(--pink)"></span><span class="n">12.7</span></div>
</div>
<div class="col-h">足したもの</div>

- **Nuxt**：Nuxt UI、@nuxt/eslint
- **Next.js**：Mantine、既存のLint設定

</div>
</div>

<div class="note">GAは回によってモジュール、公式パッケージ、自前のコードに分かれた。見た目の設定の行数はNuxt UIが半分以下だったが、これはUIライブラリの差</div>

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/results/experiment/summary.md" target="_blank">GitHub：results/experiment/summary.md</a></div>

<style>
.pairs .col-h { margin-top: 0.6rem; margin-bottom: 0; }
.pairs .bar { grid-template-columns: 4rem 1fr 3.5rem; font-size: 0.85rem; }
.pairs .bar .fill { height: 0.9rem; }
.pairs ul { font-size: 0.85rem; margin-top: 0.3rem; }
</style>

---
routeAlias: ai-experiment-point
style: "--accent: var(--cyan)"
---

<div class="kicker">03のまとめ</div>

# 答え合わせ：作るときは手間が減った

<div class="sub">Nuxtの決まりごととモジュールは、AIが作るときにも効いた。ただし後から足す段では差が出なかった</div>

| 予想 | 結果 | 根拠 |
|---|---|---|
| 1：出力とコードが少ない | <span class="ok">当たり</span> | ①で出力トークン約0.8倍、コスト約0.65倍、import約4分の1 |
| 2：手戻りや依存が少ない | <span class="warn">半分</span> | 認証はモジュール、定期処理は組み込みのNitro Tasksを使った。ビルドと型チェックの失敗、追加の依存は減らなかった |
| 3：Next.jsの方がエラーが少ない | <span class="ng">外れ</span> | ビルドと型チェックの失敗はNuxt 3回、Next.js 2回で、どちらもAIが自分で直した。人の介入は0回 |
| （②足す） | ほぼ同じ | トークン・コスト・時間に差はなかった |

<div class="notes">

- 各フレームワーク2回、1つのモデルでの結果なので、傾向として読んでほしい
- AIの学習データの量（Next.jsの方が多い）はそろえられない
- 判定もAI（テストと画面の操作）で、人による確認はしていない

</div>

<style>
table { font-size: 0.85rem; }
th, td { padding-top: 0.35rem !important; padding-bottom: 0.35rem !important; }
.warn { color: var(--yellow); }
td:nth-child(2), th:nth-child(2) { white-space: nowrap; }
</style>
