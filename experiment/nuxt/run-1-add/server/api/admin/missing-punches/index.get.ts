import type { MissingPunchView } from '#shared/types/attendance'

/** 検出した打刻漏れと、検出処理の実行履歴（新しい順） */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const employees = new Map((await listUsersByRole('employee')).map(u => [u.id, u]))
  const entries: MissingPunchView[] = await Promise.all((await listMissingPunches()).map(async (e) => {
    const current = await getRecord(e.userId, e.date)
    return {
      ...e,
      userName: employees.get(e.userId)?.name ?? e.userId,
      resolved: current === null || current.clockOut !== null,
    }
  }))
  entries.sort((a, b) => b.date.localeCompare(a.date) || a.userId.localeCompare(b.userId))
  const runs = (await listDetectionRuns()).reverse()
  return { entries, runs }
})
