// Nitro の定期処理（croner）はプロセスのローカル時刻で動く。
// 「毎日0時」を日本時間にするため、スケジューラが動き出す前に TZ を固定する。
// アプリ内の日付計算は TZ に依存しない（shared/utils/date.ts）ので、ほかへの影響はない。
export default defineNitroPlugin(() => {
  process.env.TZ = 'Asia/Tokyo'
})
