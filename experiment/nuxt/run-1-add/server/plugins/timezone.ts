// 定期処理（nitro.scheduledTasks）の cron はサーバープロセスのローカル時刻で動くため、
// 「毎日0時」が日本時間の0時になるよう、スケジューラーが起動する前にタイムゾーンを固定する。
// Nitro はプラグインを実行してからスケジューラーを起動する。
// なお日付・時刻の計算自体は、どこでも Asia/Tokyo を明示しているのでこの設定には依存しない。
export default defineNitroPlugin(() => {
  process.env.TZ = 'Asia/Tokyo'
})
