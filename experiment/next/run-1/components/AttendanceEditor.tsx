"use client";

import { useState } from "react";
import { ErrorAlert } from "@/components/Alert";
import { ApiError, apiFetch, errorMessage } from "@/lib/api-client";
import { formatDateShort } from "@/lib/time";
import type { AttendanceRow } from "@/lib/types";

type Props = {
  userId: string;
  userName: string;
  date: string;
  row?: AttendanceRow;
  onCancel: () => void;
  onSaved: (message: string) => void;
};

type BreakInput = { start: string; end: string };

const input = "rounded border border-slate-300 px-2 py-1.5 text-sm";

/** 管理者が 1 日分の出勤・退勤・休憩を修正するフォーム。入力チェックはサーバー側で行い、結果をここに出す。 */
export function AttendanceEditor({ userId, userName, date, row, onCancel, onSaved }: Props) {
  const [clockIn, setClockIn] = useState(row?.clockIn ?? "");
  const [clockOut, setClockOut] = useState(row?.clockOut ?? "");
  const [breaks, setBreaks] = useState<BreakInput[]>(
    row && row.breaks.length > 0
      ? row.breaks.map((b) => ({ start: b.start, end: b.end ?? "" }))
      : [{ start: "", end: "" }],
  );
  const [error, setError] = useState<{ message: string; details: string[] } | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(body: { clockIn: string; clockOut: string; breaks: BreakInput[] }, successText: string) {
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/admin/attendance", {
        method: "PUT",
        body: JSON.stringify({ userId, date, ...body }),
      });
      onSaved(successText);
    } catch (err) {
      setError({ message: errorMessage(err), details: err instanceof ApiError ? err.details : [] });
      setSaving(false);
    }
  }

  function updateBreak(index: number, patch: Partial<BreakInput>) {
    setBreaks((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  const title = `${userName}さん ${formatDateShort(date)} の勤怠`;

  return (
    <section className="rounded-lg border border-sky-200 bg-sky-50/40 p-6">
      <h2 className="mb-4 font-semibold text-slate-800">{title}を修正</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit({ clockIn, clockOut, breaks }, `${title}を保存しました。`);
        }}
        className="space-y-4"
      >
        {error && <ErrorAlert message={error.message} details={error.details} />}
        <div className="flex flex-wrap gap-6">
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">出勤</span>
            <input type="time" value={clockIn} onChange={(e) => setClockIn(e.target.value)} className={input} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">退勤（空欄なら打刻漏れのまま）</span>
            <input type="time" value={clockOut} onChange={(e) => setClockOut(e.target.value)} className={input} />
          </label>
        </div>

        <div className="text-sm">
          <span className="mb-1 block text-slate-600">休憩</span>
          <div className="space-y-2">
            {breaks.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="time"
                  value={b.start}
                  onChange={(e) => updateBreak(i, { start: e.target.value })}
                  className={input}
                  aria-label={`休憩${i + 1}の開始`}
                />
                <span>〜</span>
                <input
                  type="time"
                  value={b.end}
                  onChange={(e) => updateBreak(i, { end: e.target.value })}
                  className={input}
                  aria-label={`休憩${i + 1}の終了`}
                />
                <button
                  type="button"
                  onClick={() => setBreaks((prev) => prev.filter((_, j) => j !== i))}
                  className="text-xs text-slate-500 hover:text-red-600"
                >
                  削除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setBreaks((prev) => [...prev, { start: "", end: "" }])}
              className="text-xs text-sky-700 hover:underline"
            >
              ＋ 休憩を追加
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            保存
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            キャンセル
          </button>
          {row && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                if (window.confirm(`${title}を削除します。よろしいですか？`)) {
                  submit({ clockIn: "", clockOut: "", breaks: [] }, `${title}を削除しました。`);
                }
              }}
              className="ml-auto text-sm text-red-600 hover:underline"
            >
              この日の勤怠を削除
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
