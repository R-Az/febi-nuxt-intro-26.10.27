"use client";

import { STATUS_LABEL } from "@/lib/attendance";
import { datesInMonth, dayOfWeek, formatDateShort, formatDuration } from "@/lib/time";
import type { AttendanceRow, MonthTotals } from "@/lib/types";

type Props = {
  month: string;
  rows: AttendanceRow[];
  totals: MonthTotals;
  /** 渡すと各行に「修正」ボタンを出す（管理者用） */
  onEdit?: (date: string, row: AttendanceRow | undefined) => void;
  editableUntil?: string;
};

const th = "border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500";
const td = "border-b border-slate-100 px-3 py-2";

function breakText(row: AttendanceRow): string {
  if (row.breaks.length === 0) return "—";
  return row.breaks.map((b) => `${b.start}〜${b.end ?? ""}`).join(", ");
}

export function AttendanceTable({ month, rows, totals, onEdit, editableUntil }: Props) {
  const byDate = new Map(rows.map((r) => [r.date, r]));

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="tabular w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className={th}>日付</th>
            <th className={th}>出勤</th>
            <th className={th}>退勤</th>
            <th className={th}>休憩</th>
            <th className={`${th} text-right`}>休憩時間</th>
            <th className={`${th} text-right`}>実働時間</th>
            <th className={`${th} text-right`}>残業時間</th>
            <th className={th}>備考</th>
            {onEdit && <th className={th} />}
          </tr>
        </thead>
        <tbody>
          {datesInMonth(month).map((date) => {
            const row = byDate.get(date);
            const w = dayOfWeek(date);
            const weekendClass = w === 0 ? "bg-red-50/50" : w === 6 ? "bg-blue-50/50" : "";
            return (
              <tr key={date} className={weekendClass}>
                <td className={`${td} ${w === 0 ? "text-red-600" : w === 6 ? "text-blue-600" : ""}`}>
                  {formatDateShort(date)}
                </td>
                <td className={td}>{row?.clockIn ?? ""}</td>
                <td className={td}>{row ? (row.clockOut ?? "—") : ""}</td>
                <td className={`${td} text-slate-500`}>{row ? breakText(row) : ""}</td>
                <td className={`${td} text-right`}>{row ? formatDuration(row.breakMinutes) : ""}</td>
                <td className={`${td} text-right`}>
                  {row?.workMinutes != null ? formatDuration(row.workMinutes) : ""}
                </td>
                <td className={`${td} text-right`}>
                  {row?.overtimeMinutes != null ? formatDuration(row.overtimeMinutes) : ""}
                </td>
                <td className={td}>
                  {row && row.status === "missing_clock_out" && (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      {STATUS_LABEL.missing_clock_out}
                    </span>
                  )}
                  {row && row.status === "in_progress" && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                      {STATUS_LABEL.in_progress}
                    </span>
                  )}
                </td>
                {onEdit && (
                  <td className={`${td} text-right`}>
                    {(!editableUntil || date <= editableUntil) && (
                      <button
                        type="button"
                        onClick={() => onEdit(date, row)}
                        className="rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        修正
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-slate-50 font-semibold">
          <tr>
            <td className="px-3 py-2">合計</td>
            <td className="px-3 py-2" colSpan={3}>
              出勤日数 {totals.workDays} 日
            </td>
            <td className="px-3 py-2 text-right">{formatDuration(totals.breakMinutes)}</td>
            <td className="px-3 py-2 text-right">{formatDuration(totals.workMinutes)}</td>
            <td className="px-3 py-2 text-right">{formatDuration(totals.overtimeMinutes)}</td>
            <td className="px-3 py-2" colSpan={onEdit ? 2 : 1}>
              {totals.missingCount > 0 && <span className="text-red-700">打刻漏れ {totals.missingCount} 件</span>}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
