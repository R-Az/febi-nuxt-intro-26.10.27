import { isValidDateString } from '#shared/utils/time'

// 毎日0時（日本時間）に nuxt.config.ts の nitro.scheduledTasks から呼ばれる。
// 管理者画面の「今すぐ検出」からも、payload.date を指定して呼ばれる。
export default defineTask({
  meta: {
    name: 'attendance:detect-missing',
    description: '前日の打刻漏れ（退勤がない勤怠）を検出して記録する',
  },
  async run({ payload }) {
    const manual = isValidDateString(payload.date)
    const targetDate = manual
      ? (payload.date as string)
      : yesterdayInTokyo(typeof payload.scheduledTime === 'number' ? new Date(payload.scheduledTime) : new Date())
    const run = await detectMissingPunches(targetDate, manual ? 'manual' : 'schedule')
    console.info(`[attendance:detect-missing] ${run.targetDate}: ${run.found}件の打刻漏れ（新規 ${run.added}件）`)
    return { result: run }
  },
})
