"use client";

import { Suspense, useEffect, useState } from "react";
import { Loading } from "@/components/Loading";
import { ErrorAlert, SuccessAlert } from "@/components/Alert";
import { PageTitle } from "@/components/PageTitle";
import { apiDownload, apiFetch, errorMessage } from "@/lib/api-client";
import { currentMonthInJst } from "@/lib/time";
import type { PublicUser } from "@/lib/types";

// 今日の日付から初期表示の月（日）を決めるため、リクエスト時に描画する
export default function ExportPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ExportPageContent />
    </Suspense>
  );
}

function ExportPageContent() {
  const [employees, setEmployees] = useState<PublicUser[]>([]);
  const [month, setMonth] = useState(() => currentMonthInJst());
  const [userId, setUserId] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    apiFetch<{ employees: PublicUser[] }>("/api/admin/employees")
      .then((res) => setEmployees(res.employees))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  async function download() {
    setDownloading(true);
    setError(null);
    setMessage(null);
    try {
      const params = new URLSearchParams({ month, userId });
      await apiDownload(`/api/admin/export?${params}`, `attendance_${month}_${userId}.csv`);
      setMessage("CSV をダウンロードしました。");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <PageTitle>CSV出力</PageTitle>
      <div className="space-y-4">
        <ErrorAlert message={error} />
        <SuccessAlert message={message} />
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 text-sm">
          <label className="block">
            <span className="mb-1 block text-slate-600">月</span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-slate-600">従業員</span>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1.5"
            >
              <option value="all">全員</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id} {e.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={download}
            disabled={downloading || !month}
            className="rounded bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            CSV をダウンロード
          </button>
        </div>
        <div className="text-xs text-slate-500">
          <p>列：従業員ID, 氏名, 日付, 出勤, 退勤, 休憩(分), 実働(分), 残業(分), 備考</p>
          <p>文字コードは UTF-8（BOM 付き）です。Excel でそのまま開けます。出勤の記録がある日だけを出力します。</p>
        </div>
      </div>
    </div>
  );
}
