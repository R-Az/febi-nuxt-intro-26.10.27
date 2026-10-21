"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/client/api";
import type { PublicUser, Role } from "@/lib/types";

type Session = { user: PublicUser; today: string };

const SessionContext = createContext<Session | null>(null);

/** ログイン中のユーザーと、サーバー基準の今日の日付。withSession で包んだ画面の中でだけ使える。 */
export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession は withSession で包んだ画面の中で使ってください。");
  return session;
}

/** ログイン中のユーザーを読み込むまで「読み込み中」を出し、読み込めたら画面を表示する。 */
export function withSession(Page: React.ComponentType) {
  return function SessionPage() {
    const session = useContext(SessionContext);
    if (!session) return <p className="text-gray-500">読み込み中…</p>;
    return <Page />;
  };
}

const NAV: Record<Role, { href: string; label: string }[]> = {
  employee: [
    { href: "/punch", label: "打刻" },
    { href: "/attendance", label: "勤怠一覧" },
  ],
  admin: [
    { href: "/admin", label: "月次一覧" },
    { href: "/admin/attendance", label: "勤怠修正" },
    { href: "/admin/export", label: "CSV出力" },
    { href: "/admin/missing-punches", label: "打刻漏れ検出" },
  ],
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Session>("/api/auth/me")
      .then(setSession)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
          <span className="text-lg font-bold text-gray-900">勤怠管理</span>
          <nav className="flex gap-1">
            {session &&
              NAV[session.user.role].map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-3 py-2 text-sm ${
                      active
                        ? "bg-blue-50 font-medium text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {session && (
              <span className="text-gray-600">
                {session.user.name}
                <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {session.user.role === "admin" ? "管理者" : "従業員"}
                </span>
              </span>
            )}
            <button type="button" className="btn btn-secondary" onClick={logout}>
              ログアウト
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
        )}
      </main>
    </div>
  );
}
