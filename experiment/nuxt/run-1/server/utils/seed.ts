// 初期データ。サーバー起動時（最初のアクセス時）に作られ、メモリ上だけに置かれる。
import type { AttendanceRecord, BreakPeriod, Role } from '#shared/types/attendance'
import { addDays, datesInMonth, isWeekday, monthOf, shiftMonth, tokyoNow } from '#shared/utils/time'

export interface SeedUser {
  id: string
  name: string
  email: string
  password: string
  role: Role
}

/** README のアカウント一覧と同じ内容 */
export const SEED_USERS: SeedUser[] = [
  { id: 'A001', name: '山本 管理', email: 'admin@example.com', password: 'admin1234', role: 'admin' },
  { id: 'E001', name: '鈴木 一郎', email: 'suzuki@example.com', password: 'suzuki1234', role: 'employee' },
  { id: 'E002', name: '高橋 美咲', email: 'takahashi@example.com', password: 'takahashi1234', role: 'employee' },
  { id: 'E003', name: '田中 健太', email: 'tanaka@example.com', password: 'tanaka1234', role: 'employee' },
  { id: 'E004', name: '伊藤 さくら', email: 'ito@example.com', password: 'ito1234', role: 'employee' },
]

/** 毎回同じデータになるよう、文字列から決まる疑似乱数を使う */
function seededRandom(key: string): () => number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

const randInt = (rand: () => number, min: number, max: number) => min + Math.floor(rand() * (max - min + 1))

/** 先月1日から昨日までの平日（今日は打刻を試せるよう空けておく） */
export function seedDates(today: string): string[] {
  const thisMonth = monthOf(today)
  return [...datesInMonth(shiftMonth(thisMonth, -1)), ...datesInMonth(thisMonth)]
    .filter(d => d < today && isWeekday(d))
}

export function buildSeedRecords(today: string = tokyoNow().date): AttendanceRecord[] {
  const dates = seedDates(today)
  const employees = SEED_USERS.filter(u => u.role === 'employee')
  const updatedAt = new Date().toISOString()

  // 退勤の打刻がない日を2件つくる。1件は先月、もう1件は直近の平日（打刻漏れ検出の動作確認用）
  const missing = new Set<string>()
  if (dates.length > 0) {
    missing.add(`E002:${dates[Math.floor(dates.length / 3)]}`)
    missing.add(`E003:${dates[dates.length - 1]}`)
  }

  const records: AttendanceRecord[] = []
  for (const user of employees) {
    for (const date of dates) {
      const rand = seededRandom(`${user.id}:${date}`)
      const clockIn = 8 * 60 + 40 + randInt(rand, 0, 40) // 8:40〜9:20
      const clockOut = 17 * 60 + 30 + randInt(rand, 0, 180) // 17:30〜20:30
      const breaks: BreakPeriod[] = [{ start: 12 * 60, end: 13 * 60 }]
      if (rand() < 0.25) breaks.push({ start: 15 * 60, end: 15 * 60 + 15 })
      const isMissing = missing.has(`${user.id}:${date}`)
      records.push({
        userId: user.id,
        date,
        clockIn,
        clockOut: isMissing ? null : clockOut,
        breaks,
        updatedAt,
        updatedBy: user.id,
      })
    }
  }
  return records
}

/** 打刻漏れ検出のデフォルト対象日（日本時間の昨日） */
export function yesterdayInTokyo(now: Date = new Date()): string {
  return addDays(tokyoNow(now).date, -1)
}
