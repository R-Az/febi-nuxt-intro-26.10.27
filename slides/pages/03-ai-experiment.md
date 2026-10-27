---
layout: section
routeAlias: ai-experiment
style: "--accent: var(--cyan)"
---

<div class="section-num">03</div>

# AIに作らせて比べた

<div class="section-sub">同じ指示で作らせて、AIが何を書かずに済んだかを見る</div>

---

# 確かめたかったこと

<div class="ask">Nuxtの決まりごととモジュールがあると、AIが書くコードは減るのか？</div>

<div class="cols">
<div class="card">
<div class="col-h">予想1</div>

モジュールや組み込みの機能を、<br>AIも使う

</div>
<div class="card">
<div class="col-h">予想2</div>

そのぶん、AIが自前で書くコードと<br>importが減る

</div>
<div class="card">
<div class="col-h">予想3（反対の予想）</div>

学習データが多い分、Next.jsの方が<br>エラーや介入が少ない

</div>
</div>

<div class="note">予想を先に置き、結果を見てから答え合わせをする</div>

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
- **条件**：Claude Code（claude-opus-5-5）、毎回新しいセッション。止まったら決まった文面だけ返す
- **回数**：NuxtとNext.jsで、①と②を2回ずつ（計8回）
- **指示の制約**：データの読み書きはすべてAPIを通す、とした。そのためNext.jsでは、Server Componentsでの読み込みやServer Actionsは使われていない

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/tree/master/experiment" target="_blank">GitHub：検証の手順と指示文（2026.10.19〜20に実施）</a>・<a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/results/experiment/conditions.md" target="_blank">実施した条件</a></div>

---

# 書かずに済んだもの：毎日0時の定期処理

<div class="sub">同じ要件に、Nuxtでは組み込みの機能を使い、Next.jsではタイマーを自前で書いた（1回目のコードの抜粋）</div>

<div class="cols">
<div class="card">
<div class="col-h">Next.js：自前のタイマー</div>

```ts
// instrumentation.ts：起動時にタイマーを登録
export async function register() {
  startDailyScheduler()
}

// server/scheduler.ts（28行）
const scheduleNext = () => {
  setTimeout(() => {
    runDailyMissingCheck()
    scheduleNext()
  }, msUntilNextJstMidnight()) // 次の0時を計算
}
```

</div>
<div class="card">
<div class="col-h">Nuxt：組み込みのNitro Tasks</div>

```ts
// nuxt.config.ts
nitro: {
  experimental: { tasks: true },
  scheduledTasks: {
    '0 0 * * *': ['attendance:detect-missing'],
  },
},

// server/tasks/attendance/detect-missing.ts
export default defineTask({
  meta: { name: 'attendance:detect-missing' },
  async run() { /* 前日の打刻漏れを検出する */ },
})
```

</div>
</div>

<div class="note">Nitro Tasksは実験的な機能。Next.jsでは、Vercel Cronなど外の仕組みを使うことも多い</div>

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/tree/master/experiment" target="_blank">GitHub：experiment/next/run-1、experiment/nuxt/run-1</a>・<a href="https://v2.nitro.build/guide/tasks" target="_blank">Nitro：Tasks</a></div>

---

# 書かずに済んだもの：ログインとセッション

<div class="sub">Nuxtではモジュールの関数を呼び、Next.jsではハッシュ化と署名を自前で書いた（1回目のコードの抜粋）</div>

<div class="cols">
<div class="card">
<div class="col-h">Next.js：自前の実装</div>

```ts
// server/password.ts（17行）
const hash = scryptSync(password, salt, 32)
return timingSafeEqual(actual, expected)

// lib/session-token.ts（67行）
const sig = await subtle.sign('HMAC', key, data)
return `${body}.${toBase64Url(sig)}`
```

</div>
<div class="card">
<div class="col-h">Nuxt：nuxt-auth-utilsの関数</div>

```ts
// ハッシュ化と照合
passwordHash: await hashPassword(password)
await verifyPassword(user.passwordHash, password)

// 暗号化してCookieに保存する
await replaceUserSession(event, { user })
```

</div>
</div>

- **自前の行数**：Next.jsは認証と定期処理で、約120〜140行を書いた
- **公平に見ると**：Next.jsにもAuth.jsがある。AIがNuxtではモジュールを選び、Next.jsでは自前で書いた

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/tree/master/experiment" target="_blank">GitHub：experiment/next/run-1、experiment/nuxt/run-1</a>・<a href="https://github.com/atinux/nuxt-auth-utils" target="_blank">GitHub：nuxt-auth-utils</a></div>

---

# importとコードの行数（2回分）

<div class="sub">importは2回とも大きく減った。コード全体の行数は、回によって差が出たり出なかったりした</div>

<div class="cols pairs">
<div>
<div class="col-h">importの行数<span class="ratio">Nuxtは約4分の1</span></div>
<div class="bars">
<div class="bar"><span class="label">Nuxt 1回目</span><span class="fill" style="--w: 32%"></span><span class="n">55</span></div>
<div class="bar"><span class="label">Nuxt 2回目</span><span class="fill" style="--w: 20%"></span><span class="n">35</span></div>
<div class="bar"><span class="label">Next.js 1回目</span><span class="fill" style="--w: 100%; --c: var(--pink)"></span><span class="n">172</span></div>
<div class="bar"><span class="label">Next.js 2回目</span><span class="fill" style="--w: 97%; --c: var(--pink)"></span><span class="n">167</span></div>
</div>
</div>
<div>
<div class="col-h">コード全体の行数</div>
<div class="bars">
<div class="bar"><span class="label">Nuxt 1回目</span><span class="fill" style="--w: 86%"></span><span class="n">2,562</span></div>
<div class="bar"><span class="label">Nuxt 2回目</span><span class="fill" style="--w: 61%"></span><span class="n">1,803</span></div>
<div class="bar"><span class="label">Next.js 1回目</span><span class="fill" style="--w: 86%; --c: var(--pink)"></span><span class="n">2,556</span></div>
<div class="bar"><span class="label">Next.js 2回目</span><span class="fill" style="--w: 100%; --c: var(--pink)"></span><span class="n">2,972</span></div>
</div>
</div>
</div>

- **import**：自動インポートの分と、認証をモジュールに任せた分が効いた
- **全体**：1回目はほぼ同じ。画面やテストの書き方など、AIの書き方の揺れの方が大きい

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/results/experiment/summary.md" target="_blank">GitHub：results/experiment/summary.md（clocで数え、ロックファイルは除いた）</a></div>

<style>
.pairs .col-h { margin-bottom: 0.2rem; }
.pairs .bar { grid-template-columns: 6.5rem 1fr 3.5rem; font-size: 0.85rem; }
.pairs .bar .fill { height: 0.9rem; }
</style>

---

# 補足：AIの手間の数字（2回分）

<div class="sub">AIや検証の設定にも左右されるので、参考として見てほしい</div>

| 段階 | 指標 | Nuxt（1回目 / 2回目） | Next.js（1回目 / 2回目） |
|---|---|--:|--:|
| ① 作る | 出力トークン | 76,866 / 72,868 | 91,344 / 99,771 |
| ① 作る | 推定コスト（USD） | 3.73 / 4.11 | 5.26 / 6.73 |
| ① 作る | 所要時間（分） | 13.2 / 11.7 | 14.6 / 18.1 |
| ② 足す | 出力トークン | 69,423 / 63,907 | 73,279 / 65,538 |
| ② 足す | 推定コスト（USD） | 6.29 / 5.59 | 6.12 / 5.40 |
| ② 足す | 所要時間（分） | 13.7 / 12.9 | 13.4 / 11.9 |

<div class="note">②は、NuxtがNuxt UIと@nuxt/eslint、Next.jsがMantineと既存のLint設定で足した。手間に差はなかった</div>

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/results/experiment/summary.md" target="_blank">GitHub：results/experiment/summary.md（トークンとコストはccusageで集計）</a></div>

<style>
table { font-size: 0.85rem; }
th, td { padding-top: 0.3rem !important; padding-bottom: 0.3rem !important; }
</style>

---
routeAlias: ai-experiment-point
style: "--accent: var(--cyan)"
---

<div class="kicker">03のまとめ</div>

# 答え合わせ：AIも用意された仕組みを使った

<div class="sub">Nuxtでは、AIが認証と定期処理を自前で書かずに済んだ。エラーの多さには差がなかった</div>

| 予想 | 結果 | 根拠 |
|---|---|---|
| 1：用意された仕組みを使う | <span class="ok">当たり</span> | 2回とも、認証はnuxt-auth-utils、定期処理はNitro Tasks |
| 2：自前のコードとimportが減る | <span class="warn">一部当たり</span> | Next.jsは約120〜140行を自前で書いた。importは約4分の1。全体の行数は1回目ほぼ同じ |
| 3：Next.jsの方がエラーが少ない | <span class="warn">差なし</span> | ビルドと型チェックの失敗はNuxt 3回、Next.js 2回。介入はどちらも0回 |

<div class="notes">

- 各フレームワーク2回、1つのモデルでの結果なので、傾向として読んでほしい
- 指示でAPIを通す形にしたので、Next.jsの強み（Server Components、Server Actions）は比べていない
- 判定もAI（テストと画面の操作）で、人による確認はしていない

</div>

<style>
table { font-size: 0.85rem; }
th, td { padding-top: 0.35rem !important; padding-bottom: 0.35rem !important; }
td:nth-child(2), th:nth-child(2) { white-space: nowrap; }
.warn { color: var(--yellow); }
</style>
