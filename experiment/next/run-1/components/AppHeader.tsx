"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { PublicUser } from "@/lib/types";

const NAV = {
  employee: [
    { href: "/punch", label: "打刻" },
    { href: "/attendance", label: "勤怠一覧" },
  ],
  admin: [
    { href: "/admin", label: "月次一覧" },
    { href: "/admin/attendance", label: "勤怠の修正" },
    { href: "/admin/missing", label: "打刻漏れ" },
    { href: "/admin/export", label: "CSV出力" },
  ],
} as const;

export function AppHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    apiFetch<{ user: PublicUser }>("/api/auth/me")
      .then((res) => setUser(res.user))
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    setLoggingOut(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      // 前のユーザーの画面の状態（裏で保持されている画面も含む）を残さないよう、再読み込みで移動する
      window.location.replace("/login");
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-8 px-6">
        <span className="font-bold text-slate-800">勤怠管理</span>
        <nav className="flex flex-1 gap-1">
          {user &&
            NAV[user.role].map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded px-3 py-1.5 text-sm ${
                    active ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">
              {user.name}
              <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                {user.role === "admin" ? "管理者" : "従業員"}
              </span>
            </span>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="rounded border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
