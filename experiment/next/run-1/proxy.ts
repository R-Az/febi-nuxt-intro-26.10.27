// 画面へのアクセスを、ログイン状態と役割で振り分ける。
// API（/api/*）はここでは扱わず、各 Route Handler が 401 / 403 を返す。

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const home = session?.role === "admin" ? "/admin" : "/punch";

  if (pathname === "/login") {
    return session ? NextResponse.redirect(new URL(home, request.url)) : NextResponse.next();
  }
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname === "/") {
    return NextResponse.redirect(new URL(home, request.url));
  }
  // 役割に合わない画面は、その役割のトップへ戻す（データは API 側でも守っている）
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdminPage !== (session.role === "admin")) {
    return NextResponse.redirect(new URL(home, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
