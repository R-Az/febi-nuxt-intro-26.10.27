// Route Handler 用の共通処理（認証・権限チェック・エラー応答）。

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session-token";
import type { Role } from "@/lib/types";
import type { UserRecord } from "./seed";
import { findUserById } from "./store";

export function jsonError(status: number, error: string, details?: string[]): NextResponse {
  return NextResponse.json(details ? { error, details } : { error }, { status });
}

export async function getSessionUser(request: NextRequest): Promise<UserRecord | null> {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = findUserById(session.uid);
  // 役割が変わっていたら古いセッションは使わせない
  if (!user || user.role !== session.role) return null;
  return user;
}

type AuthResult = { user: UserRecord; response?: undefined } | { user?: undefined; response: NextResponse };

/**
 * ログインと役割を確かめる。ログインしていなければ 401、役割が違えば 403 の応答を返す。
 */
export async function requireUser(request: NextRequest, role?: Role): Promise<AuthResult> {
  const user = await getSessionUser(request);
  if (!user) return { response: jsonError(401, "ログインしてください。") };
  if (role && user.role !== role) return { response: jsonError(403, "この操作を行う権限がありません。") };
  return { user };
}

/** JSON の本文を読む。読めなければ undefined。 */
export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
