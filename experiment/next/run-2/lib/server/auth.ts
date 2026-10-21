import "server-only";
// API の認証・認可（受け入れ条件1・8）。
// 未ログインは 401、権限がないものは 403 を返す。

import type { NextRequest } from "next/server";
import { findUserById, type UserRow } from "@/lib/server/db";
import { jsonError } from "@/lib/server/http";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

type AuthResult =
  | { ok: true; user: UserRow }
  | { ok: false; response: Response };

export function getSessionUser(request: NextRequest): UserRow | null {
  const payload = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  return findUserById(payload.userId) ?? null;
}

export function requireUser(request: NextRequest): AuthResult {
  const user = getSessionUser(request);
  if (!user) return { ok: false, response: jsonError(401, "ログインしてください。") };
  return { ok: true, user };
}

export function requireAdmin(request: NextRequest): AuthResult {
  const auth = requireUser(request);
  if (!auth.ok) return auth;
  if (auth.user.role !== "admin") {
    return { ok: false, response: jsonError(403, "この操作を行う権限がありません。") };
  }
  return auth;
}

/** 本人か管理者だけが読める。 */
export function requireSelfOrAdmin(request: NextRequest, userId: string): AuthResult {
  const auth = requireUser(request);
  if (!auth.ok) return auth;
  if (auth.user.role !== "admin" && auth.user.id !== userId) {
    return { ok: false, response: jsonError(403, "他の従業員のデータにはアクセスできません。") };
  }
  return auth;
}

/** 本人の従業員だけが書き込める（打刻）。管理者は代理で打刻できない。 */
export function requireSelfEmployee(request: NextRequest, userId: string): AuthResult {
  const auth = requireUser(request);
  if (!auth.ok) return auth;
  if (auth.user.role !== "employee" || auth.user.id !== userId) {
    return { ok: false, response: jsonError(403, "本人以外は打刻できません。") };
  }
  return auth;
}
