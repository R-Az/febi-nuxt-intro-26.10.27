// 署名付き Cookie によるセッション。
// proxy.ts（別バンドル）からも使うため、メモリ上のデータには依存させない。

import { createHmac, timingSafeEqual } from "node:crypto";
import type { Role } from "@/lib/types";

export const SESSION_COOKIE = "attendance_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export type SessionPayload = {
  userId: string;
  role: Role;
  /** 有効期限（UNIX秒） */
  exp: number;
};

const DEV_SECRET = "dev-only-session-secret-change-me";

function getSecret(): string {
  return process.env.SESSION_SECRET || DEV_SECRET;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createSessionToken(
  userId: string,
  role: Role,
  now: number = Date.now(),
): string {
  const payload: SessionPayload = {
    userId,
    role,
    exp: Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

/** 署名と有効期限を確かめ、正しければ中身を返す。 */
export function verifySessionToken(
  token: string | undefined,
  now: number = Date.now(),
): SessionPayload | null {
  if (!token) return null;
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const expected = Buffer.from(sign(data));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    if (typeof payload.userId !== "string" || typeof payload.exp !== "number") return null;
    if (payload.role !== "admin" && payload.role !== "employee") return null;
    if (payload.exp * 1000 <= now) return null;
    return payload;
  } catch {
    return null;
  }
}
