---
layout: section
routeAlias: when-to-use
style: "--accent: var(--orange)"
---

<div class="section-num">04</div>

# 向いている場面

<div class="section-sub">PoCや社内ツールには向いている。向かない場面もある</div>

---

# 私の考え <span class="badge" style="--c: var(--orange)">私見</span>

<div class="sub">AIがコードを書く今、フレームワークを選ぶ理由が変わってきている</div>

<div class="cols">
<div class="card">
<div class="col-h">速度は決め手になりにくい</div>

- 社内ツールの規模なら、フレームワークの差よりAPIやデータ量の差の方が大きい
- 極端に重くしない限り、体感の差は出にくい

</div>
<div class="card">
<div class="col-h">ReactかVueかに、こだわりすぎなくていい</div>

- これまでは採用しやすさでReactを選ぶことが多かった
- AIが書くなら、広く使われているフレームワークで大きくは困らない（直す力は人の側に要る）

</div>
<div class="card">
<div class="col-h">業務アプリなら扱いやすい</div>

- 定番のモジュールがそろい、人がライブラリを選んで確かめる手間が減る
- 画面の更新の仕組み（リアクティビティ）が素直で、AIのコードも読みやすい

</div>
</div>

<div class="note">出たばかりのOSSを業務で使うのは別の話で、広く使われていることが前提</div>

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
