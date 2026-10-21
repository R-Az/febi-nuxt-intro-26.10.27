import type { MissingPunchView } from '#shared/types/attendance'

// 定期処理で検出した打刻漏れの一覧（新しい日付順）
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const [logs, employees] = await Promise.all([listMissingPunchLogs(), listEmployees()])
  const names = new Map(employees.map(e => [e.id, e.name]))
  const views: MissingPunchView[] = await Promise.all(logs.map(async (log) => {
    const record = await getAttendance(log.userId, log.date)
    return {
      ...log,
      userName: names.get(log.userId) ?? log.userId,
      // 管理者が退勤を補った（または記録を消した）ら対応済み
      resolved: record === null || record.clockOut !== null,
    }
  }))
  return views.sort((a, b) => b.date.localeCompare(a.date) || a.userId.localeCompare(b.userId))
})
