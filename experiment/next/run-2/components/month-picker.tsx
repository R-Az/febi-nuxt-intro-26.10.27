"use client";

import { addMonths } from "@/lib/time";

const MONTHS_BACK = 24;

function label(month: string): string {
  const [y, m] = month.split("-");
  return `${y}年${Number(m)}月`;
}

/** 月の選択。max（今月）より先は選べない。 */
export function MonthPicker({
  value,
  max,
  onChange,
}: {
  value: string;
  max: string;
  onChange: (month: string) => void;
}) {
  const options = Array.from({ length: MONTHS_BACK }, (_, i) => addMonths(max, -i));
  const min = options.at(-1)!;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="btn btn-secondary px-3"
        onClick={() => onChange(addMonths(value, -1))}
        disabled={value <= min}
        aria-label="前の月"
      >
        ◀
      </button>
      <select
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="対象月"
      >
        {options.map((m) => (
          <option key={m} value={m}>
            {label(m)}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-secondary px-3"
        onClick={() => onChange(addMonths(value, 1))}
        disabled={value >= max}
        aria-label="次の月"
      >
        ▶
      </button>
    </div>
  );
}
