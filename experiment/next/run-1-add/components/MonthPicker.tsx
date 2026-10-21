"use client";

import { Button, Group } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { addMonths } from "@/lib/time";

/** 月（YYYY-MM）を選ぶ。前月・翌月のボタンと、カレンダーから選ぶ入力欄。 */
export function MonthPicker({ value, onChange }: { value: string; onChange: (month: string) => void }) {
  return (
    <Group gap="xs" wrap="nowrap">
      <Button
        variant="default"
        leftSection={<IconChevronLeft size={16} />}
        onClick={() => onChange(addMonths(value, -1))}
        aria-label="前の月"
      >
        前月
      </Button>
      <MonthPickerInput
        value={`${value}-01`}
        onChange={(date) => date && onChange(date.slice(0, 7))}
        valueFormat="YYYY年M月"
        aria-label="表示する月"
        w={130}
      />
      <Button
        variant="default"
        rightSection={<IconChevronRight size={16} />}
        onClick={() => onChange(addMonths(value, 1))}
        aria-label="次の月"
      >
        翌月
      </Button>
    </Group>
  );
}
