// メモリ上のモックデータ層。API（Route Handler）と定期処理だけがここを使う。
// 開発サーバーではルートごとにモジュールが読み直されることがあるため、globalThis に 1 つだけ持つ。
// サーバーを再起動すると初期データに戻る。

import { formatTime } from "@/lib/time";
import type { AttendanceRecord, MissingClockOutLog, PublicUser } from "@/lib/types";
import { createSeedDatabase, recordKey, type Database, type UserRecord } from "./seed";

const globalStore = globalThis as typeof globalThis & { __kintaiDb?: Database };

function db(): Database {
  if (!globalStore.__kintaiDb) globalStore.__kintaiDb = createSeedDatabase();
  return globalStore.__kintaiDb;
}

export function toPublicUser(user: UserRecord): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// ---- ユーザー ----

export function findUserByEmail(email: string): UserRecord | undefined {
  const normalized = email.trim().toLowerCase();
  return db().users.find((u) => u.email.toLowerCase() === normalized);
}

export function findUserById(id: string): UserRecord | undefined {
  return db().users.find((u) => u.id === id);
}

export function listEmployees(): PublicUser[] {
  return db()
    .users.filter((u) => u.role === "employee")
    .map(toPublicUser);
}

// ---- 勤怠 ----

function clone(record: AttendanceRecord): AttendanceRecord {
  return { ...record, breaks: record.breaks.map((b) => ({ ...b })) };
}

export function getRecord(userId: string, date: string): AttendanceRecord | null {
  const r = db().records.get(recordKey(userId, date));
  return r ? clone(r) : null;
}

/** 指定した月の勤怠を日付順に返す。 */
export function listRecordsByMonth(userId: string, month: string): AttendanceRecord[] {
  return [...db().records.values()]
    .filter((r) => r.userId === userId && r.date.startsWith(`${month}-`))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(clone);
}

export function listRecordsByDate(date: string): AttendanceRecord[] {
  return [...db().records.values()].filter((r) => r.date === date).map(clone);
}

export function saveRecord(record: AttendanceRecord): AttendanceRecord {
  const saved = clone(record);
  db().records.set(recordKey(record.userId, record.date), saved);
  return clone(saved);
}

export function deleteRecord(userId: string, date: string): void {
  db().records.delete(recordKey(userId, date));
}

// ---- 打刻漏れの検出記録 ----

export function listMissingLogs(): MissingClockOutLog[] {
  return [...db().missingLogs];
}

/**
 * 指定した日の打刻漏れ（出勤があって退勤がない勤怠）を検出して記録する。
 * 同じ人・同じ日の記録がすでにあれば重ねて記録しない。
 * @returns 今回新しく記録したもの
 */
export function detectMissingClockOuts(
  date: string,
  source: MissingClockOutLog["source"],
  now: Date = new Date(),
): MissingClockOutLog[] {
  const store = db();
  const added: MissingClockOutLog[] = [];
  for (const r of listRecordsByDate(date)) {
    if (r.clockOut !== null) continue;
    if (store.missingLogs.some((l) => l.userId === r.userId && l.date === date)) continue;
    const log: MissingClockOutLog = {
      id: String(store.nextLogId++),
      date,
      userId: r.userId,
      userName: findUserById(r.userId)?.name ?? r.userId,
      clockIn: formatTime(r.clockIn),
      detectedAt: now.toISOString(),
      source,
    };
    store.missingLogs.push(log);
    added.push(log);
  }
  store.missingLogs.sort((a, b) => b.date.localeCompare(a.date) || a.userId.localeCompare(b.userId));
  return added;
}
