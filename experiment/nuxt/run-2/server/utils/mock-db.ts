// モックのデータ層。データはすべてメモリ上に持ち、サーバーを再起動すると初期データに戻る。
// 画面からは直接読まず、必ず server/api の API を通して読み書きする。
import type { AttendanceRecord, MissingPunchLog, PublicUser } from '#shared/types/attendance'
import { addDays, addMonths, isWeekday, nowInJst } from '#shared/utils/date'
import { fromMinutes } from '#shared/utils/attendance'

export interface UserRow extends PublicUser {
  passwordHash: string
}

interface MockDb {
  users: UserRow[]
  /** key: `${userId}|${date}` */
  attendance: Map<string, AttendanceRecord>
  missingPunchLogs: MissingPunchLog[]
  nextMissingPunchLogId: number
}

/** 初期ユーザー。パスワードは起動時にハッシュ化して保持する */
export const SEED_USERS: (PublicUser & { password: string })[] = [
  { id: 'A001', name: '管理 花子', email: 'admin@example.com', password: 'admin1234', role: 'admin' },
  { id: 'E001', name: '佐藤 健', email: 'sato@example.com', password: 'sato1234', role: 'employee' },
  { id: 'E002', name: '鈴木 美咲', email: 'suzuki@example.com', password: 'suzuki1234', role: 'employee' },
  { id: 'E003', name: '高橋 翔', email: 'takahashi@example.com', password: 'takahashi1234', role: 'employee' },
  { id: 'E004', name: '田中 由紀', email: 'tanaka@example.com', password: 'tanaka1234', role: 'employee' },
]

let dbPromise: Promise<MockDb> | null = null

/** データ層を取得する。初回だけ初期データを作る */
export function useMockDb(): Promise<MockDb> {
  dbPromise ??= createSeededDb()
  return dbPromise
}

export function attendanceKey(userId: string, date: string): string {
  return `${userId}|${date}`
}

async function createSeededDb(): Promise<MockDb> {
  const users = await Promise.all(
    SEED_USERS.map(async ({ password, ...user }) => ({ ...user, passwordHash: await hashPassword(password) })),
  )
  const db: MockDb = {
    users,
    attendance: new Map(),
    missingPunchLogs: [],
    nextMissingPunchLogId: 1,
  }
  for (const record of buildSeedAttendance(users.filter(u => u.role === 'employee').map(u => u.id))) {
    db.attendance.set(attendanceKey(record.userId, record.date), record)
  }
  // 過去の分は毎日0時の定期処理がすでに動いていたものとして、検出結果も入れておく
  for (const record of [...db.attendance.values()].filter(r => r.clockOut === null).sort((a, b) => a.date.localeCompare(b.date))) {
    db.missingPunchLogs.push({
      id: db.nextMissingPunchLogId++,
      userId: record.userId,
      date: record.date,
      detectedAt: new Date(`${addDays(record.date, 1)}T00:00:00+09:00`).toISOString(),
    })
  }
  return db
}

/** 0〜n-1 の決まった値を返す（初期データを毎回同じにするための簡易ハッシュ） */
function pseudoRandom(seed: string, n: number): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % n
}

/**
 * 先月1日から昨日までの平日の勤怠を作る（祝日は考慮しない）。
 * うち2件は出勤だけして退勤がない日にする。
 */
function buildSeedAttendance(employeeIds: string[]): AttendanceRecord[] {
  const today = nowInJst().date
  const thisMonth = today.slice(0, 7)
  const firstDay = `${addMonths(thisMonth, -1)}-01`

  const weekdays: string[] = []
  for (let d = firstDay; d < today; d = addDays(d, 1)) {
    if (isWeekday(d)) weekdays.push(d)
  }

  // 打刻漏れの日：E002 は先月、E004 は今月（今月に平日がなければ先月の終わり頃）
  const thisMonthWeekdays = weekdays.filter(d => d.startsWith(thisMonth))
  const missing = new Set<string>()
  if (weekdays.length > 0) {
    missing.add(attendanceKey('E002', weekdays[Math.min(4, weekdays.length - 1)]!))
    const e004Day = thisMonthWeekdays.length > 0
      ? thisMonthWeekdays[Math.max(0, thisMonthWeekdays.length - 3)]!
      : weekdays.at(-2) ?? weekdays.at(-1)!
    missing.add(attendanceKey('E004', e004Day))
  }

  const records: AttendanceRecord[] = []
  for (const userId of employeeIds) {
    for (const date of weekdays) {
      const seed = `${userId}${date}`
      const clockIn = fromMinutes(8 * 60 + 45 + pseudoRandom(seed + 'in', 4) * 10) // 08:45〜09:15
      // 17:45〜20:45。残業の日がほどよく混ざるようにする
      const clockOut = fromMinutes(17 * 60 + 45 + pseudoRandom(seed + 'out', 13) * 15)
      const breaks: AttendanceRecord['breaks'] = [{ start: '12:00', end: pseudoRandom(seed + 'br', 4) === 0 ? '12:45' : '13:00' }]
      if (pseudoRandom(seed + 'br2', 5) === 0) {
        breaks.push({ start: '15:00', end: '15:15' })
      }
      const isMissing = missing.has(attendanceKey(userId, date))
      records.push({ userId, date, clockIn, clockOut: isMissing ? null : clockOut, breaks })
    }
  }
  return records
}
