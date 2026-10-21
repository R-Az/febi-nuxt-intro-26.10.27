import type { DetectionRun } from '#shared/types/attendance'

/**
 * 指定日の打刻漏れ（出勤だけあって退勤がない記録）を検出して記録する。
 * 同じ従業員・同じ日を二重に記録しないので、何度実行してもよい。
 */
export async function detectMissingPunches(targetDate: string, trigger: DetectionRun['trigger']): Promise<DetectionRun> {
  const detectedAt = new Date().toISOString()
  const missing = (await listRecordsByDate(targetDate)).filter(r => r.clockOut === null)
  let added = 0
  for (const r of missing) {
    if (await addMissingPunch({ userId: r.userId, date: r.date, clockIn: r.clockIn, detectedAt })) added++
  }
  return addDetectionRun({ targetDate, ranAt: detectedAt, trigger, found: missing.length, added })
}
