// 初期データ。サーバー起動後に最初にデータ層へアクセスしたときに作られる。

import { addDays, addMonths, datesInMonth, formatTime, isWeekday, jstToIso, todayInJst } from "@/lib/time";
import type { AttendanceRecord, MissingClockOutLog, Role } from "@/lib/types";
import { hashPassword } from "./password";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
};

export type Database = {
  users: UserRecord[];
  /** キーは `${userId}|${date}` */
  records: Map<string, AttendanceRecord>;
  missingLogs: MissingClockOutLog[];
  nextLogId: number;
};

/** README に載せるログイン用アカウント。パスワードは平文でここにだけ書く。 */
export const SEED_ACCOUNTS: { id: string; name: string; email: string; password: string; role: Role }[] = [
  { id: "A001", name: "佐藤 恵子", email: "admin@example.com", password: "admin1234", role: "admin" },
  { id: "E001", name: "鈴木 一郎", email: "suzuki@example.com", password: "password1", role: "employee" },
  { id: "E002", name: "高橋 花子", email: "takahashi@example.com", password: "password2", role: "employee" },
  { id: "E003", name: "田中 健太", email: "tanaka@example.com", password: "password3", role: "employee" },
  { id: "E004", name: "伊藤 美咲", email: "ito@example.com", password: "password4", role: "employee" },
];

export function recordKey(userId: string, date: string): string {
  return `${userId}|${date}`;
}

/** 同じ日付・同じ人なら毎回同じ値になる、簡単な擬似乱数。 */
function hash(a: number, b: number): number {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

export function createSeedDatabase(now: Date = new Date()): Database {
  const today = todayInJst(now);
  const thisMonth = today.slice(0, 7);
  const lastMonth = addMonths(thisMonth, -1);
  const createdAt = now.toISOString();

  const users: UserRecord[] = SEED_ACCOUNTS.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    passwordHash: hashPassword(a.password),
    role: a.role,
  }));
  const employees = users.filter((u) => u.role === "employee");

  // 先月と今月の平日のうち、今日より前の日（今日の分は実際に打刻して試せるよう空けておく）
  const pastWeekdays = [...datesInMonth(lastMonth), ...datesInMonth(thisMonth)].filter(
    (d) => isWeekday(d) && d < today,
  );

  // 打刻漏れ（出勤だけで退勤がない日）を 2 件入れる
  const missing = new Set([
    recordKey(employees[1].id, pastWeekdays[2]),
    recordKey(employees[3].id, pastWeekdays[pastWeekdays.length - 1]),
  ]);

  const records = new Map<string, AttendanceRecord>();
  employees.forEach((emp, ei) => {
    pastWeekdays.forEach((date, di) => {
      const h = hash(ei + 1, di + 1);
      const clockIn = 8 * 60 + 45 + (h % 4) * 10; // 8:45〜9:15
      const clockOut = 17 * 60 + 30 + ((h >>> 4) % 13) * 15; // 17:30〜20:30
      const breaks = [{ start: 12 * 60, end: 13 * 60 }];
      if ((h >>> 9) % 5 === 0) breaks.push({ start: 15 * 60, end: 15 * 60 + 15 });
      const key = recordKey(emp.id, date);
      records.set(key, {
        userId: emp.id,
        date,
        clockIn,
        clockOut: missing.has(key) ? null : clockOut,
        breaks,
        updatedAt: createdAt,
        updatedBy: emp.id,
      });
    });
  });

  // 毎日 0 時の定期処理がこれまで動いていた想定で、過去の打刻漏れの検出記録も入れておく
  let nextLogId = 1;
  const missingLogs: MissingClockOutLog[] = [];
  for (const key of missing) {
    const r = records.get(key)!;
    const user = users.find((u) => u.id === r.userId)!;
    missingLogs.push({
      id: String(nextLogId++),
      date: r.date,
      userId: r.userId,
      userName: user.name,
      clockIn: formatTime(r.clockIn),
      detectedAt: jstToIso(addDays(r.date, 1), 0),
      source: "schedule",
    });
  }
  missingLogs.sort((a, b) => b.date.localeCompare(a.date));

  return { users, records, missingLogs, nextLogId };
}
