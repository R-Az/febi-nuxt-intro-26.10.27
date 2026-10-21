---
layout: section
routeAlias: ai-experiment
style: "--accent: var(--cyan)"
---

<div class="section-num">03</div>

# AIに作らせて比べた

<div class="section-sub">同じ指示で、NuxtとNext.jsに勤怠管理アプリを作らせる</div>

---

# 何を比べたか

<div class="sub">同じAI・同じ指示文で、小さな会社向けの勤怠管理アプリを作らせた</div>

<div class="flow">
  <div class="step">同じ指示文<small>フレームワーク名だけ変える</small></div>
  <lucide-arrow-right class="arrow" />
  <div class="step lit">① 作る<small>ゼロからアプリを作る</small></div>
  <lucide-arrow-right class="arrow" />
  <div class="step lit">② 足す<small>UI部品・Lint・GAを足す</small></div>
  <lucide-arrow-right class="arrow" />
  <div class="step">判定<small>別のAIが画面を操作して確かめる</small></div>
</div>

- **アプリ**：従業員10〜30人の会社で使う勤怠管理。DBはモックにして、APIは自分で書かせる
- **回数**：NuxtとNext.jsで、①と②を2回ずつ（計8回）
- **見たもの**：手間（トークン・コスト・時間）、コードの量、受け入れ条件を満たしたか

<div class="bridge">指示文の中身と、条件のそろえ方は<b>次の2枚</b>で</div>

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/tree/master/experiment" target="_blank">GitHub：検証の手順と指示文（2026.10.19〜20に実施）</a></div>

---

# 指示文と受け入れ条件

<div class="sub">AIにはこの条件を渡し、満たしたかどうかは別のAIが画面を操作して確かめた</div>

<div class="cols">
<div class="card">
<div class="col-h">① 作る（12件）</div>

<ol class="reqs">
<li>ログインとログアウト</li>
<li>打刻（押せない打刻はサーバーでも弾く）</li>
<li>自分の勤怠一覧</li>
<li>実働・残業・打刻漏れの計算</li>
<li>管理者の月次一覧</li>
<li>管理者の修正（不正な値は弾く）</li>
<li>CSV出力（列・書式・BOM）</li>
<li>権限（401と403）</li>
<li>毎日0時の定期処理</li>
<li>計算ルールの単体テスト</li>
<li>型チェックとビルド</li>
<li>README</li>
</ol>

</div>
<div class="card">
<div class="col-h">② 足す（6件）</div>

<ol class="reqs one">
<li>UI部品で画面を作り直す（ダークモード）</li>
<li>テーマ設定で主色・角丸・書体・行の高さ</li>
<li>Lintを入れてエラー0件</li>
<li>Google Analyticsは同意後に読み込む</li>
<li>今ある機能を壊さない</li>
<li>README</li>
</ol>

</div>
</div>

<div class="note">指示文にはフレームワーク固有の用語やライブラリ名を書かない。「APIを用意する」「定番のライブラリを使ってよい」とだけ書いた</div>

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/experiment/prompt.md" target="_blank">GitHub：①の指示文</a>・<a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/experiment/prompt-add.md" target="_blank">②の指示文</a></div>

<style>
.reqs { columns: 2; column-gap: 1.2rem; font-size: 0.8rem; line-height: 1.55; margin: 0; padding-left: 1.2rem; }
.reqs.one { columns: 1; }
</style>

---

# 条件のそろえ方と測り方

<div class="sub">どちらにも同じ条件で作らせ、数字はログとコマンドの出力から取った</div>

<div class="cols">
<div class="card">
<div class="col-h">そろえた条件</div>

- **AI**：Claude Code 2.1.299、claude-opus-5-5、effort high
- **環境**：毎回新しいセッション。リポジトリの外の空フォルダで、MCPはオフ
- **介入**：止まったら決まった文面を返す（例：「合理的に判断して進めてください」）。直し方は教えない

</div>
<div class="card measure">
<div class="col-h">測り方</div>

| 指標 | 取り方 |
|---|---|
| トークン・コスト | セッションのログをccusageで集計 |
| コード行数 | cloc（ロックファイルは除く） |
| import行数 | importで始まる行を数える |
| ②の変更量 | 始める前とのgit diff |
| 受け入れ条件 | 別のAIが画面の操作・テスト・curlで確かめる |

</div>
</div>

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/experiment/README.md" target="_blank">GitHub：計測と判定の手順</a>・<a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/results/experiment/conditions.md" target="_blank">実施した条件</a></div>

<style>
.measure table { font-size: 0.88rem; margin: 0; }
.measure th, .measure td { padding: 0.35rem 0.5rem; }
</style>

---

# ① 作る：Nuxtの方が書く量が少なかった

<div class="sub">各2回の平均（1つのモデル）。どちらも人の介入なしで、受け入れ条件12件をすべて満たした</div>

| 指標 | Nuxt | Next.js | Nuxt / Next.js |
|---|--:|--:|--:|
| 出力トークン | 74,867 | 95,558 | 約0.8倍 |
| 推定コスト（USD） | 3.92 | 5.99 | 約0.65倍 |
| 所要時間（分） | 12.5 | 16.3 | 約0.8倍 |
| コード行数 | 2,183 | 2,764 | 約0.8倍 |
| importの行数 | 45 | 170 | 約0.25倍 |

<div v-click class="punch">書く量もコストも、Nuxtの方が少なく済んだ</div>

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/results/experiment/summary.md" target="_blank">GitHub：results/experiment/summary.md</a></div>

---
class: roomy
---

# importの行は約4分の1

<div class="sub">自動インポートの差に、認証などをモジュールに任せた分の差が加わった</div>

<div class="bars">
<div class="bar"><span class="label">Nuxt 1回目</span><span class="fill" style="--w: 32%"></span><span class="n">55</span></div>
<div class="bar"><span class="label">Nuxt 2回目</span><span class="fill" style="--w: 20%"></span><span class="n">35</span></div>
<div class="bar"><span class="label">Next.js 1回目</span><span class="fill" style="--w: 100%; --c: var(--pink)"></span><span class="n">172</span></div>
<div class="bar"><span class="label">Next.js 2回目</span><span class="fill" style="--w: 97%; --c: var(--pink)"></span><span class="n">167</span></div>
</div>

- **Nuxt**：`ref`や`useFetch`、自作のcomposableやコンポーネントはimportなしで使える
- **Next.js**：コンポーネント、フック、自作の関数をファイルごとにimportする

<div class="note">コード全体の行数の差（約0.8倍）より、importの差の方がずっと大きい</div>

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/results/experiment/summary.md" target="_blank">GitHub：results/experiment/summary.md（importで始まる行を数えた）</a></div>

---

# AIもモジュールを選んでいた

<div class="sub">同じ要件に、Nuxtはモジュールで、Next.jsは自前のコードで応えた</div>

| 要件 | Nuxt（2回とも） | Next.js（2回とも） |
|---|---|---|
| ログインとセッション | `nuxt-auth-utils`モジュール | 署名付きCookieとパスワードのハッシュ化を自前で実装 |
| 毎日0時の定期処理 | Nitro Tasks（`scheduledTasks`） | 自前のタイマー（1回目はVercelのcron設定も追加） |
| 単体テスト | Vitest | Vitest |

<div v-click class="punch">決まった置き場所と定番のモジュールがあると、AIもそれを使う</div>

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/tree/master/experiment" target="_blank">GitHub：作られたアプリのコード（experiment/nuxt、experiment/next）</a></div>

---

# ② 足す：手間はほぼ同じだった

<div class="sub">UI部品・カスタマイズ・Lint・GAを足させた。2回の平均で、どちらも条件18件をすべて満たした</div>

| 指標 | Nuxt | Next.js |
|---|--:|--:|
| 出力トークン | 66,665 | 69,409 |
| 推定コスト（USD） | 5.94 | 5.76 |
| 所要時間（分） | 13.3 | 12.7 |
| 設定・つなぎ込みの追加行数 | 172 | 206 |

- **足したもの**：NuxtはNuxt UIとモジュール、Next.jsはMantineと既存のLint設定、自前のコード
- **見た目の設定**：行数はNuxt UIが半分以下。ただしフレームワークよりUIライブラリの差

<div class="source"><lucide-flask-conical /><a href="https://github.com/R-Az/febi-nuxt-intro-26.10.27/blob/master/results/experiment/summary.md" target="_blank">GitHub：results/experiment/summary.md</a></div>

---
routeAlias: ai-experiment-point
style: "--accent: var(--cyan)"
---

<div class="kicker">03のまとめ</div>

# AIで作っても、Nuxtは書く量が少なかった

<div class="sub">作るときに差が出て、足すときはほぼ互角だった</div>

<div class="cols">
<div class="card">
<div class="col-h">① 作る</div>

出力トークンは約0.8倍、コストは約0.65倍、importは約4分の1。認証と定期処理はモジュールに任せていた

</div>
<div class="card">
<div class="col-h">② 足す</div>

トークン・コスト・時間はほぼ同じ。どちらも定番のUIライブラリとLintで足せた

</div>
</div>

<div class="notes">

- 各フレームワーク2回、1つのモデルでの結果なので、傾向として読んでほしい
- AIの学習データの量（Next.jsの方が多い）はそろえられない
- 判定もAI（画面の操作とコマンド）で、人による確認はしていない
- 依存の数はNuxtの方が多い（型チェック用のパッケージを自分で追加したため）

</div>
