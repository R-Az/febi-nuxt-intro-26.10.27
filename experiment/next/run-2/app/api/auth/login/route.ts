import { NextResponse, type NextRequest } from "next/server";
import { findUserByEmail, toPublicUser } from "@/lib/server/db";
import { jsonError, readJson } from "@/lib/server/http";
import { verifyPassword } from "@/lib/server/password";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await readJson(request);
  const { email, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return jsonError(400, "メールアドレスとパスワードを入力してください。");
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return jsonError(401, "メールアドレスまたはパスワードが正しくありません。");
  }

  const response = NextResponse.json({ user: toPublicUser(user) });
  response.cookies.set(SESSION_COOKIE, createSessionToken(user.id, user.role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
