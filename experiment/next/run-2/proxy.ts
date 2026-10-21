// 画面へのアクセス制御。ログインしていなければログイン画面へ、役割に合わない画面は各自のトップへ移す。
// API の認証・認可は各ルートハンドラで行う（ここでは API を対象にしない）。

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import type { Role } from "@/lib/types";

const HOME: Record<Role, string> = { admin: "/admin", employee: "/punch" };
const EMPLOYEE_PAGES = ["/punch", "/attendance"];

function startsWithPath(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const redirect = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (pathname === "/login") {
    return session ? redirect(HOME[session.role]) : NextResponse.next();
  }
  if (!session) return redirect("/login");

  if (pathname === "/") return redirect(HOME[session.role]);
  if (startsWithPath(pathname, "/admin") && session.role !== "admin") {
    return redirect(HOME[session.role]);
  }
  if (EMPLOYEE_PAGES.some((p) => startsWithPath(pathname, p)) && session.role !== "employee") {
    return redirect(HOME[session.role]);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
