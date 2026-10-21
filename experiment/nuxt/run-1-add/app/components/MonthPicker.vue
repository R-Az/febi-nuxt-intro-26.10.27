<script setup lang="ts">
import { shiftMonth } from '#shared/utils/time'

const month = defineModel<string>({ required: true })

function onChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (value) month.value = value
}
</script>

<template>
  <UFieldGroup>
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-chevron-left"
      aria-label="前の月"
      @click="month = shiftMonth(month, -1)"
    >
      前月
    </UButton>
    <UInput
      type="month"
      :model-value="month"
      aria-label="対象月"
      @change="onChange"
    />
    <UButton
      color="neutral"
      variant="outline"
      trailing-icon="i-lucide-chevron-right"
      aria-label="次の月"
      @click="month = shiftMonth(month, 1)"
    >
      翌月
    </UButton>
  </UFieldGroup>
</template>
