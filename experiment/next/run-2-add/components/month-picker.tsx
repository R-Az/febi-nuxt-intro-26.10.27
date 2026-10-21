"use client";

import { ActionIcon, Group, NativeSelect } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
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
    <Group gap="xs" wrap="nowrap">
      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => onChange(addMonths(value, -1))}
        disabled={value <= min}
        aria-label="前の月"
      >
        <IconChevronLeft size={18} />
      </ActionIcon>
      <NativeSelect
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        aria-label="対象月"
        data={options.map((m) => ({ value: m, label: label(m) }))}
      />
      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => onChange(addMonths(value, 1))}
        disabled={value >= max}
        aria-label="次の月"
      >
        <IconChevronRight size={18} />
      </ActionIcon>
    </Group>
  );
}
