"use client";

import { useState } from "react";
import { ApiClientError, apiFetch, errorMessage } from "@/lib/client/api";
import { dayOfWeek, WEEKDAY_LABELS } from "@/lib/time";
import type { DaySummary, PublicUser } from "@/lib/types";

type BreakInput = { start: string; end: string };

/** 1日分の勤怠を修正するダイアログ。入力チェックはサーバー側で行い、エラーをそのまま表示する。 */
export function RecordEditor({
  user,
  date,
  summary,
  onClose,
  onSaved,
}: {
  user: PublicUser;
  date: string;
  summary: DaySummary | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [clockIn, setClockIn] = useState(summary?.clockIn ?? "");
  const [clockOut, setClockOut] = useState(summary?.clockOut ?? "");
  const [breaks, setBreaks] = useState<BreakInput[]>(
    summary?.breaks.map((b) => ({ start: b.start, end: b.end ?? "" })) ?? [],
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const dateLabel = `${date.replaceAll("-", "/")}（${WEEKDAY_LABELS[dayOfWeek(date)]}）`;

  function updateBreak(index: number, field: keyof BreakInput, value: string) {
    setBreaks((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  }

  async function save(body: { clockIn: string; clockOut: string; breaks: BreakInput[] }) {
    setSaving(true);
    setErrors([]);
    try {
      await apiFetch(`/api/admin/attendance/${user.id}/${date}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      const deleted = !body.clockIn && !body.clockOut && body.breaks.length === 0;
      onSaved(`${user.name}さんの ${dateLabel} の勤怠を${deleted ? "削除" : "保存"}しました。`);
    } catch (e) {
      if (e instanceof ApiClientError && e.details.length > 0) {
        setErrors([e.message, ...e.details]);
      } else {
        setErrors([errorMessage(e)]);
      }
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-editor-title"
    >
      <form
        className="card w-full max-w-lg space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save({ clockIn, clockOut, breaks });
        }}
      >
        <h2 id="record-editor-title" className="text-lg font-bold">
          勤怠の修正：{user.name}・{dateLabel}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="block text-sm text-gray-700">出勤</span>
            <input
              type="time"
              className="input w-full"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className="block text-sm text-gray-700">退勤</span>
            <input
              type="time"
              className="input w-full"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
            />
          </label>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm text-gray-700">休憩</legend>
          {breaks.length === 0 && <p className="text-sm text-gray-500">休憩はありません。</p>}
          {breaks.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="time"
                className="input"
                aria-label={`休憩${i + 1} 開始`}
                value={b.start}
                onChange={(e) => updateBreak(i, "start", e.target.value)}
              />
              <span>〜</span>
              <input
                type="time"
                className="input"
                aria-label={`休憩${i + 1} 終了`}
                value={b.end}
                onChange={(e) => updateBreak(i, "end", e.target.value)}
              />
              <button
                type="button"
                className="text-sm text-red-600 hover:underline"
                onClick={() => setBreaks((prev) => prev.filter((_, j) => j !== i))}
              >
                削除
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={() => setBreaks((prev) => [...prev, { start: "", end: "" }])}
          >
            ＋ 休憩を追加
          </button>
        </fieldset>

        <p className="text-xs text-gray-500">
          退勤を空欄で保存すると「打刻漏れ」のままになります。すべて空欄で保存すると、その日の記録を削除します。
        </p>

        {errors.length > 0 && (
          <ul role="alert" className="list-disc space-y-1 rounded-md bg-red-50 p-3 pl-7 text-sm text-red-700">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between gap-2">
          {summary ? (
            <button
              type="button"
              className="btn btn-danger"
              disabled={saving}
              onClick={() => {
                if (window.confirm("この日の記録を削除します。よろしいですか？")) {
                  save({ clockIn: "", clockOut: "", breaks: [] });
                }
              }}
            >
              記録を削除
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
