import "server-only";
import { addDays, isWeekday } from "@/lib/time";
import type { AttendanceRecord, Role } from "@/lib/types";

export type SeedUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
};

// README のアカウント一覧と合わせること。
export const SEED_USERS: SeedUser[] = [
  { id: "A001", name: "佐藤 花子", email: "admin@example.com", password: "admin1234", role: "admin" },
  { id: "E001", name: "鈴木 一郎", email: "suzuki@example.com", password: "password1234", role: "employee" },
  { id: "E002", name: "高橋 美咲", email: "takahashi@example.com", password: "password1234", role: "employee" },
  { id: "E003", name: "田中 健太", email: "tanaka@example.com", password: "password1234", role: "employee" },
  { id: "E004", name: "伊藤 さくら", email: "ito@example.com", password: "password1234", role: "employee" },
];

/** 文字列から決まった疑似乱数を作る（起動のたびに同じ初期データにするため）。 */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateRecord(userId: string, date: string): AttendanceRecord {
  const h = hash(`${userId}:${date}`);
  const clockIn = 8 * 60 + 40 + (h % 40); // 8:40〜9:19
  const clockOut = 17 * 60 + 30 + ((h >>> 8) % 181); // 17:30〜20:30
  const breakStart = (h >>> 16) % 4 === 0 ? 12 * 60 + 15 : 12 * 60; // 45分 or 60分
  return {
    userId,
    date,
    clockIn: minutesToTime(clockIn),
    clockOut: minutesToTime(clockOut),
    breaks: [{ start: minutesToTime(breakStart), end: "13:00" }],
  };
}

/**
 * 先月1日から昨日までの平日について、従業員全員の勤怠を作る。
 * 今日の分は打刻を試せるように空けておく。
 * 直近の平日のうち2件を「出勤だけ打刻して退勤がない日」にする。
 */
export function generateSeedRecords(today: string): AttendanceRecord[] {
  const [y, m] = today.split("-").map(Number);
  const firstOfLastMonth = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 10);
  const employees = SEED_USERS.filter((u) => u.role === "employee");

  const weekdays: string[] = [];
  for (let d = firstOfLastMonth; d < today; d = addDays(d, 1)) {
    if (isWeekday(d)) weekdays.push(d);
  }

  const records = weekdays.flatMap((date) =>
    employees.map((u) => generateRecord(u.id, date)),
  );

  // 打刻漏れ: 高橋さんの直近の平日、伊藤さんの3つ前の平日
  const missing: [string, string | undefined][] = [
    ["E002", weekdays.at(-1)],
    ["E004", weekdays.at(-3)],
  ];
  for (const [userId, date] of missing) {
    const record = records.find((r) => r.userId === userId && r.date === date);
    if (record) record.clockOut = null;
  }

  return records;
}
