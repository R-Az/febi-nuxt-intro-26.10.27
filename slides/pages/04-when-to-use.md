---
layout: section
routeAlias: when-to-use
style: "--accent: var(--orange)"
---

<div class="section-num">04</div>

# 向いている場面

<div class="section-sub">PoCや社内ツールには向いている。向かない場面もある</div>

---
class: roomy
---

# Next.jsの強みも押さえておく

<div class="sub">利用者の多さとReactの資産は、Nuxtにはない強み</div>

- **情報と人の多さ**：困ったときの答えや、経験のある人が見つかりやすい
- **Reactのエコシステム**：UI部品やSaaSのSDKは、React向けが先に出ることが多い
- **Server Components**：サーバーで動かす部品を選べ、ブラウザに送るJSを減らせる
- **Server Functions**：フォームの送信などを、APIのURLを作らずに関数として呼べる
- **React Native**：モバイルアプリと、知識やコードを共有しやすい

<div v-click class="punch">作るものとチームに合わせて選べば大丈夫です</div>

<div class="source"><lucide-link /><a href="https://nextjs.org/docs/app/getting-started/server-and-client-components" target="_blank">Next.js：Server and Client Components</a>・<a href="https://nextjs.org/docs/app/getting-started/mutating-data" target="_blank">Next.js：Mutating Data</a></div>

---

# つまずきやすいところの違い：VueとReact

<div class="sub">「画面が更新されない」「何度も動く」は、Reactでは描画の仕組みを意識しないと起きやすい</div>

<div class="cols">
<div class="card">
<div class="col-h">React</div>

```tsx
// ① ✗ 直接書き換えても、画面は変わらない
// records.push(newRecord)
// ① ○ 新しい配列を作ってsetする
setRecords([...records, newRecord])

// ② 描画のたびに別のオブジェクトになり、毎回動く
const filter = { month }
useEffect(() => {
  load(filter)
}, [filter])
```

</div>
<div class="card">
<div class="col-h">Vue</div>

```ts
// ① 書き換えれば、そのまま画面に反映される
records.value.push(newRecord)

// ② setupは一度だけ動く。値が変わったときに動く
const filter = reactive({ month: '2026-10' })
watch(filter, () => load(filter), {
  immediate: true, // useEffectと同じく初回も動かす
})
```

</div>
</div>

- **①**：Reactは新しい値を作ってsetし直す。Vueは書き換えを自動で検出する
- **②**：Reactは描画のたびに関数が動き直す。正しくは<code>[month]</code>を依存にする。React Compiler（2025.10安定版）でメモ化の多くは自動になる

<div class="source"><lucide-link /><a href="https://ja.react.dev/learn/updating-objects-in-state" target="_blank">React：state内のオブジェクトの更新</a>・<a href="https://ja.react.dev/learn/removing-effect-dependencies" target="_blank">React：エフェクトから依存値を取り除く</a>・<a href="https://ja.vuejs.org/guide/essentials/reactivity-fundamentals" target="_blank">Vue.js：リアクティビティーの基礎</a>・<a href="https://react.dev/blog/2025/10/07/react-compiler-1" target="_blank">React Blog：React Compiler v1.0</a></div>

---

# 私の考え（1）：速度と採用 <span class="badge" style="--c: var(--orange)">私見</span>

<div class="sub">AIがコードを書く今、フレームワークを選ぶ理由が変わってきている</div>

<div class="cols">
<div class="card">
<div class="col-h">速度の差は、決め手になりにくい</div>

- 手元の業務アプリの規模では、フレームワークの差より、APIやデータ量の差の方が大きいと感じている
- 社内ツールの規模なら、極端に重くしない限り体感の差は出にくい

</div>
<div class="card">
<div class="col-h">ReactかVueかに、こだわりすぎなくていい</div>

- AIが書くなら、広く使われているフレームワークであれば大きくは困らない
- ただし、固有の問題が起きたときに直せる力は人の側に要る

</div>
</div>

<div class="note">出たばかりのOSSを業務で使うのは別の話で、広く使われていることが前提</div>

---

# 私の考え（2）：扱いやすさ <span class="badge" style="--c: var(--orange)">私見</span>

<div class="sub">決まっていることが多いので、業務アプリを素早く作りやすい</div>

<div class="cols">
<div class="card">
<div class="col-h">信頼できるモジュール</div>

- ライブラリはAI任せにせず、人が選んで確かめる
- 定番のモジュールがそろっていると、その手間が減る

</div>
<div class="card">
<div class="col-h">更新の仕組みが素直</div>

- 「画面が更新されない」「何度も動く」でつまずくことが少ない
- 業務アプリなら、Reactほど細かい管理は要らない

</div>
<div class="card">
<div class="col-h">UIが読みやすい</div>

- テンプレートとスクリプトが分かれ、画面の形がすぐ分かる
- <code>v-if</code>などVue独自の書き方は、好みが分かれる

</div>
</div>

---
routeAlias: when-to-use-point
style: "--accent: var(--orange)"
---

<div class="kicker">04のまとめ</div>

# Nuxtが向いている場面、向かない場面

<div class="sub">画面とAPIを少人数で素早く作るなら、選択肢に入る</div>

<div class="cols">
<div class="card lit">
<div class="col-h ok"><lucide-check /> 向いている</div>

- **PoC・検証**：まず動く形を早く見せたい
- **社内ツール・管理画面**：テンプレートとUI部品で足りる
- **少人数の業務アプリ**：画面とAPIを1つのサーバーで済ませたい
- **Vueに慣れたチーム**：今の知識がそのまま使える

</div>
<div class="card">
<div class="col-h ng"><lucide-x /> 慎重に考えたい</div>

- **React前提のライブラリ**：使いたいSDKや部品がReact向けにしかない
- **React Nativeとの共有**：モバイルアプリとコードを共有したい
- **Reactに慣れたチーム**：学び直しの時間が取れない
- **大規模・長期の運用**：React前提の体制や資産がすでにある

</div>
</div>
