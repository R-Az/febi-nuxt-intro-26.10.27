"use client";

import { addMonths } from "@/lib/time";

export function MonthPicker({ value, onChange }: { value: string; onChange: (month: string) => void }) {
  const button = "rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm hover:bg-slate-50";
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={button} onClick={() => onChange(addMonths(value, -1))} aria-label="前の月">
        ◀ 前月
      </button>
      <input
        type="month"
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
        aria-label="表示する月"
      />
      <button type="button" className={button} onClick={() => onChange(addMonths(value, 1))} aria-label="次の月">
        翌月 ▶
      </button>
    </div>
  );
}
