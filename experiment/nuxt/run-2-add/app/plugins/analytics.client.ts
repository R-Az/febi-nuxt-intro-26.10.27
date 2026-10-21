// 同意済みの利用者は、最初の画面の表示とハイドレーションが終わってから gtag.js を読み込む。
// onNuxtReady はブラウザが空いた時（requestIdleCallback）に呼ばれるので、表示を妨げない。
export default defineNuxtPlugin(() => {
  const { start } = useAnalytics()
  onNuxtReady(() => start())
})
