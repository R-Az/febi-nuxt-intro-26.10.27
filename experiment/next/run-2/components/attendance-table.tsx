import { dayOfWeek, formatDuration, WEEKDAY_LABELS } from "@/lib/time";
import type { DayStatus, DaySummary, MonthlyAttendance, MonthTotals } from "@/lib/types";

const STATUS_BADGE: Record<DayStatus, { label: string; className: string } | null> = {
  complete: null,
  missing: { label: "打刻漏れ", className: "bg-red-100 text-red-700" },
  working: { label: "勤務中", className: "bg-blue-100 text-blue-700" },
};

function StatusBadge({ status }: { status: DayStatus }) {
  const badge = STATUS_BADGE[status];
  if (!badge) return null;
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${badge.className}`}>
      {badge.label}
    </span>
  );
}

function duration(minutes: number | null, status: DayStatus): React.ReactNode {
  if (minutes !== null) return formatDuration(minutes);
  return status === "missing" ? <span className="text-red-600">打刻漏れ</span> : "—";
}

export function TotalsSummary({ totals }: { totals: MonthTotals }) {
  const items = [
    { label: "出勤日数", value: `${totals.workDays}日` },
    { label: "休憩合計", value: formatDuration(totals.breakMinutes) },
    { label: "実働合計", value: formatDuration(totals.workMinutes) },
    { label: "残業合計", value: formatDuration(totals.overtimeMinutes) },
    { label: "打刻漏れ", value: `${totals.missingCount}件` },
  ];
  return (
    <dl className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="card py-4">
          <dt className="text-xs text-gray-500">{item.label}</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** 月の日ごとの勤怠表。renderAction を渡すと右端に操作列を出す。 */
export function AttendanceTable({
  data,
  renderAction,
}: {
  data: MonthlyAttendance;
  renderAction?: (date: string, summary: DaySummary | null) => React.ReactNode;
}) {
  return (
    <div className="card overflow-x-auto p-0">
      <table className="table">
        <thead>
          <tr>
            <th>日付</th>
            <th>出勤</th>
            <th>退勤</th>
            <th className="num">休憩</th>
            <th className="num">実働</th>
            <th className="num">残業</th>
            <th>状態</th>
            {renderAction && <th />}
          </tr>
        </thead>
        <tbody>
          {data.days.map(({ date, summary }) => {
            const w = dayOfWeek(date);
            const weekend = w === 0 || w === 6;
            return (
              <tr key={date} className={weekend ? "bg-gray-50 text-gray-500" : undefined}>
                <td>
                  {date.slice(5).replace("-", "/")}
                  <span className={`ml-1 ${w === 0 ? "text-red-500" : w === 6 ? "text-blue-500" : ""}`}>
                    （{WEEKDAY_LABELS[w]}）
                  </span>
                </td>
                <td>{summary?.clockIn ?? ""}</td>
                <td>{summary?.clockOut ?? ""}</td>
                <td className="num">{summary ? formatDuration(summary.breakMinutes) : ""}</td>
                <td className="num">{summary ? duration(summary.workMinutes, summary.status) : ""}</td>
                <td className="num">
                  {summary ? duration(summary.overtimeMinutes, summary.status) : ""}
                </td>
                <td>{summary && <StatusBadge status={summary.status} />}</td>
                {renderAction && <td className="text-right">{renderAction(date, summary)}</td>}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="font-medium">
            <td>合計</td>
            <td colSpan={2}>出勤 {data.totals.workDays}日</td>
            <td className="num">{formatDuration(data.totals.breakMinutes)}</td>
            <td className="num">{formatDuration(data.totals.workMinutes)}</td>
            <td className="num">{formatDuration(data.totals.overtimeMinutes)}</td>
            <td>{data.totals.missingCount > 0 && `打刻漏れ ${data.totals.missingCount}件`}</td>
            {renderAction && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
