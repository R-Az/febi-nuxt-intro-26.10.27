import type { DetectMissingResult } from '../../../tasks/attendance/detect-missing'

// 毎日0時の定期処理を手動で実行する（動作確認用）
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { result } = await runTask('attendance:detect-missing')
  return result as DetectMissingResult
})
