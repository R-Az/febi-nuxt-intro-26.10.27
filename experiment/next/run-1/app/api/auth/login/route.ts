import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession } from "@/lib/session-token";
import { jsonError, readJson } from "@/server/http";
import { verifyPassword } from "@/server/password";
import { findUserByEmail, toPublicUser } from "@/server/store";

export async function POST(request: NextRequest) {
  const body = await readJson(request);
  const email = typeof body === "object" && body !== null ? (body as Record<string, unknown>).email : undefined;
  const password = typeof body === "object" && body !== null ? (body as Record<string, unknown>).password : undefined;
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return jsonError(400, "メールアドレスとパスワードを入力してください。");
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return jsonError(401, "メールアドレスまたはパスワードが正しくありません。");
  }

  const token = await signSession({
    uid: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  });
  const response = NextResponse.json({ user: toPublicUser(user) });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
