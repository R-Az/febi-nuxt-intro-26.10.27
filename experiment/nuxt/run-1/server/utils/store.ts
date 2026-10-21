// モックのデータ層。データベースの代わりにメモリ上に持つ（再起動で初期データに戻る）。
// API ハンドラーはここの関数だけを使ってデータを読み書きする。
import type {
  AttendanceRecord,
  DetectionRun,
  MissingPunchEntry,
  PublicUser,
  Role,
} from '#shared/types/attendance'
import { monthOf } from '#shared/utils/time'
import { SEED_USERS, buildSeedRecords } from './seed'

interface StoredUser extends PublicUser {
  passwordHash: string
}

interface Store {
  users: StoredUser[]
  /** キーは `${userId}:${date}` */
  records: Map<string, AttendanceRecord>
  missingPunches: MissingPunchEntry[]
  detectionRuns: DetectionRun[]
  nextId: number
}

let storePromise: Promise<Store> | null = null

async function createStore(): Promise<Store> {
  const users = await Promise.all(SEED_USERS.map(async ({ password, ...u }) => ({
    ...u,
    passwordHash: await hashPassword(password),
  })))
  const records = new Map<string, AttendanceRecord>()
  for (const r of buildSeedRecords()) records.set(recordKey(r.userId, r.date), r)
  return { users, records, missingPunches: [], detectionRuns: [], nextId: 1 }
}

function getStore(): Promise<Store> {
  storePromise ??= createStore()
  return storePromise
}

const recordKey = (userId: string, date: string) => `${userId}:${date}`

const clone = <T>(value: T): T => structuredClone(value)

export function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

// ---- ユーザー ----

export async function findUserById(id: string): Promise<PublicUser | null> {
  const user = (await getStore()).users.find(u => u.id === id)
  return user ? toPublicUser(user) : null
}

/** メールアドレスとパスワードが合っていればユーザーを返す */
export async function verifyCredentials(email: string, password: string): Promise<PublicUser | null> {
  const normalized = email.trim().toLowerCase()
  const user = (await getStore()).users.find(u => u.email.toLowerCase() === normalized)
  if (!user) return null
  return (await verifyPassword(user.passwordHash, password)) ? toPublicUser(user) : null
}

export async function listUsersByRole(role: Role): Promise<PublicUser[]> {
  return (await getStore()).users.filter(u => u.role === role).map(toPublicUser)
}

// ---- 勤怠 ----

export async function getRecord(userId: string, date: string): Promise<AttendanceRecord | null> {
  const record = (await getStore()).records.get(recordKey(userId, date))
  return record ? clone(record) : null
}

export async function listRecordsByMonth(userId: string, month: string): Promise<AttendanceRecord[]> {
  const { records } = await getStore()
  return [...records.values()]
    .filter(r => r.userId === userId && monthOf(r.date) === month)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(clone)
}

export async function listRecordsByDate(date: string): Promise<AttendanceRecord[]> {
  const { records } = await getStore()
  return [...records.values()].filter(r => r.date === date).map(clone)
}

export async function saveRecord(record: AttendanceRecord): Promise<AttendanceRecord> {
  const { records } = await getStore()
  records.set(recordKey(record.userId, record.date), clone(record))
  return clone(record)
}

export async function deleteRecord(userId: string, date: string): Promise<boolean> {
  return (await getStore()).records.delete(recordKey(userId, date))
}

// ---- 打刻漏れの検出記録 ----

export async function listMissingPunches(): Promise<MissingPunchEntry[]> {
  return clone((await getStore()).missingPunches)
}

/** 同じ従業員・同じ日の検出がまだなければ追加する。追加したら true */
export async function addMissingPunch(entry: Omit<MissingPunchEntry, 'id'>): Promise<boolean> {
  const store = await getStore()
  if (store.missingPunches.some(e => e.userId === entry.userId && e.date === entry.date)) return false
  store.missingPunches.push({ id: store.nextId++, ...entry })
  return true
}

export async function listDetectionRuns(): Promise<DetectionRun[]> {
  return clone((await getStore()).detectionRuns)
}

export async function addDetectionRun(run: Omit<DetectionRun, 'id'>): Promise<DetectionRun> {
  const store = await getStore()
  const saved = { id: store.nextId++, ...run }
  store.detectionRuns.push(saved)
  return clone(saved)
}
