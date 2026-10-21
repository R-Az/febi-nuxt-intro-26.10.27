// モックのデータ層を読み書きする関数。API はこれだけを使う。
import type { AttendanceRecord, MissingPunchLog, PublicUser } from '#shared/types/attendance'
import { attendanceKey, type UserRow, useMockDb } from './mock-db'

export function toPublicUser(user: UserRow): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

const clone = <T>(value: T): T => structuredClone(value)

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const db = await useMockDb()
  const normalized = email.trim().toLowerCase()
  return db.users.find(u => u.email.toLowerCase() === normalized)
}

export async function findUserById(id: string): Promise<PublicUser | undefined> {
  const db = await useMockDb()
  const user = db.users.find(u => u.id === id)
  return user && toPublicUser(user)
}

export async function listEmployees(): Promise<PublicUser[]> {
  const db = await useMockDb()
  return db.users.filter(u => u.role === 'employee').map(toPublicUser)
}

export async function getAttendance(userId: string, date: string): Promise<AttendanceRecord | null> {
  const db = await useMockDb()
  const record = db.attendance.get(attendanceKey(userId, date))
  return record ? clone(record) : null
}

/** 指定した月（'YYYY-MM'）の勤怠を日付順で返す */
export async function listAttendanceByMonth(userId: string, month: string): Promise<AttendanceRecord[]> {
  const db = await useMockDb()
  return [...db.attendance.values()]
    .filter(r => r.userId === userId && r.date.startsWith(`${month}-`))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(clone)
}

export async function listAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  const db = await useMockDb()
  return [...db.attendance.values()].filter(r => r.date === date).map(clone)
}

export async function saveAttendance(record: AttendanceRecord): Promise<AttendanceRecord> {
  const db = await useMockDb()
  db.attendance.set(attendanceKey(record.userId, record.date), clone(record))
  return clone(record)
}

export async function deleteAttendance(userId: string, date: string): Promise<void> {
  const db = await useMockDb()
  db.attendance.delete(attendanceKey(userId, date))
}

export async function listMissingPunchLogs(): Promise<MissingPunchLog[]> {
  const db = await useMockDb()
  return db.missingPunchLogs.map(clone)
}

/** 打刻漏れを記録する。同じ人・同じ日がすでにあれば何もしない */
export async function addMissingPunchLog(userId: string, date: string, detectedAt: string): Promise<MissingPunchLog | null> {
  const db = await useMockDb()
  if (db.missingPunchLogs.some(l => l.userId === userId && l.date === date)) return null
  const log: MissingPunchLog = { id: db.nextMissingPunchLogId++, userId, date, detectedAt }
  db.missingPunchLogs.push(log)
  return clone(log)
}
