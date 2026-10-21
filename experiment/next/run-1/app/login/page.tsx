"use client";

import { useState } from "react";
import { ErrorAlert } from "@/components/Alert";
import { apiFetch, errorMessage } from "@/lib/api-client";
import type { PublicUser } from "@/lib/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { user } = await apiFetch<{ user: PublicUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      window.location.href = user.role === "admin" ? "/admin" : "/punch";
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-bold text-slate-800">勤怠管理 ログイン</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorAlert message={error} />
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">メールアドレス</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">パスワード</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-slate-800 py-2.5 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? "ログイン中…" : "ログイン"}
          </button>
        </form>
      </div>
    </main>
  );
}
