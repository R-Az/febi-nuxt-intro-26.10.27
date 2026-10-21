"use client";

import { useEffect, useState } from "react";
import { useSession, withSession } from "@/components/app-shell";
import { MonthPicker } from "@/components/month-picker";
import { CSV_HEADER } from "@/lib/attendance/csv";
import { apiDownload, apiFetch, errorMessage } from "@/lib/client/api";
import type { PublicUser } from "@/lib/types";

function AdminExportPage() {
  const { today } = useSession();
  const currentMonth = today.slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [userId, setUserId] = useState("all");
  const [employees, setEmployees] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    apiFetch<{ employees: PublicUser[] }>("/api/admin/employees")
      .then((res) => setEmployees(res.employees))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  async function download() {
    setDownloading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ month, userId });
      const { blob, filename } = await apiDownload(`/api/admin/export?${params}`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">CSV出力</h1>
      <section className="card space-y-5">
        <div className="space-y-1">
          <span className="block text-sm text-gray-700">対象月</span>
          <MonthPicker value={month} max={currentMonth} onChange={setMonth} />
        </div>
        <label className="block space-y-1">
          <span className="block text-sm text-gray-700">従業員</span>
          <select className="input" value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="all">全員</option>
            {employees.map((u) => (
              <option key={u.id} value={u.id}>
                {u.id} {u.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-primary" onClick={download} disabled={downloading}>
          {downloading ? "作成中…" : "CSVをダウンロード"}
        </button>
        {error && (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        )}
      </section>
      <section className="space-y-1 text-sm text-gray-600">
        <p>列：{CSV_HEADER.join(", ")}</p>
        <p>
          勤怠の記録がある日を出力します。文字コードは UTF-8（BOM付き）なので、Excel
          でそのまま開けます。打刻漏れの日は実働・残業を空欄にし、備考に「打刻漏れ」と入れます。
        </p>
      </section>
    </div>
  );
}

export default withSession(AdminExportPage);
