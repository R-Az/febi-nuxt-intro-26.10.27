import "server-only";
// モックのデータ層。データはメモリ上にだけ持ち、サーバーを再起動すると初期データに戻る。
// 開発時のホットリロードや、instrumentation とルートハンドラでモジュールが別々に読み込まれても
// 同じデータを共有できるよう、globalThis に1つだけ置く。

import { hashPassword } from "@/lib/server/password";
import { generateSeedRecords, SEED_USERS } from "@/lib/server/seed";
import { nowInTokyo } from "@/lib/time";
import type {
  AttendanceRecord,
  DetectionRun,
  PublicUser,
  Role,
} from "@/lib/types";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
};

export type DetectionRow = {
  userId: string;
  date: string;
  clockIn: string | null;
  detectedAt: string;
};

type Store = {
  users: UserRow[];
  /** key: `${userId}:${date}` */
  records: Map<string, AttendanceRecord>;
  /** key: `${userId}:${date}` */
  detections: Map<string, DetectionRow>;
  runs: DetectionRun[];
};

const globalForStore = globalThis as typeof globalThis & {
  __attendanceStore?: Store;
};

function createStore(): Store {
  const today = nowInTokyo().date;
  const records = new Map<string, AttendanceRecord>();
  for (const r of generateSeedRecords(today)) records.set(key(r.userId, r.date), r);
  return {
    users: SEED_USERS.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      passwordHash: hashPassword(u.password),
    })),
    records,
    detections: new Map(),
    runs: [],
  };
}

function store(): Store {
  globalForStore.__attendanceStore ??= createStore();
  return globalForStore.__attendanceStore;
}

function key(userId: string, date: string): string {
  return `${userId}:${date}`;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

// ---- ユーザー ----

export function toPublicUser(user: UserRow): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export function findUserByEmail(email: string): UserRow | undefined {
  const normalized = email.trim().toLowerCase();
  return store().users.find((u) => u.email.toLowerCase() === normalized);
}

export function findUserById(id: string): UserRow | undefined {
  return store().users.find((u) => u.id === id);
}

export function listEmployees(): PublicUser[] {
  return store()
    .users.filter((u) => u.role === "employee")
    .map(toPublicUser);
}

// ---- 勤怠 ----

export function getRecord(userId: string, date: string): AttendanceRecord | null {
  const r = store().records.get(key(userId, date));
  return r ? clone(r) : null;
}

/** month: "YYYY-MM" */
export function listRecordsByMonth(userId: string, month: string): AttendanceRecord[] {
  return [...store().records.values()]
    .filter((r) => r.userId === userId && r.date.startsWith(`${month}-`))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(clone);
}

export function listRecordsByDate(date: string): AttendanceRecord[] {
  return [...store().records.values()].filter((r) => r.date === date).map(clone);
}

export function saveRecord(record: AttendanceRecord): void {
  store().records.set(key(record.userId, record.date), clone(record));
}

export function deleteRecord(userId: string, date: string): void {
  store().records.delete(key(userId, date));
}

// ---- 打刻漏れの検出記録 ----

/** 同じ従業員・同じ日の検出がすでにあれば追加しない。追加したら true。 */
export function addDetection(row: DetectionRow): boolean {
  const k = key(row.userId, row.date);
  if (store().detections.has(k)) return false;
  store().detections.set(k, clone(row));
  return true;
}

export function listDetections(): DetectionRow[] {
  return [...store().detections.values()].map(clone);
}

export function addRun(run: DetectionRun): void {
  store().runs.push(clone(run));
}

export function listRuns(): DetectionRun[] {
  return store().runs.map(clone);
}
