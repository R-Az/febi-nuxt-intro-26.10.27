// 毎日0時（日本時間）に実行し、前日の打刻漏れを検出して記録する。
// スケジュールは nuxt.config.ts の nitro.scheduledTasks で設定している。
export interface DetectMissingResult {
  date: string
  detectedCount: number
}

export default defineTask<DetectMissingResult>({
  meta: {
    name: 'attendance:detect-missing',
    description: '前日の打刻漏れ（退勤なし）を検出して記録する',
  },
  async run() {
    const now = new Date()
    const date = yesterdayInJst(now)
    const detected = await detectMissingPunches(date, now)
    console.info(`[attendance:detect-missing] ${date}: ${detected.length} 件の打刻漏れを記録しました`)
    return { result: { date, detectedCount: detected.length } satisfies DetectMissingResult }
  },
})
