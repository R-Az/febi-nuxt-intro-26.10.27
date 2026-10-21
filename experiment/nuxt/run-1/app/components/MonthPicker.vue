<script setup lang="ts">
import { shiftMonth } from '#shared/utils/time'

const month = defineModel<string>({ required: true })

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (value) month.value = value
}
</script>

<template>
  <div class="month-picker">
    <button
      type="button"
      class="btn btn-sm"
      aria-label="前の月"
      @click="month = shiftMonth(month, -1)"
    >
      ‹ 前月
    </button>
    <input
      type="month"
      :value="month"
      aria-label="対象月"
      @change="onInput"
    >
    <button
      type="button"
      class="btn btn-sm"
      aria-label="次の月"
      @click="month = shiftMonth(month, 1)"
    >
      翌月 ›
    </button>
  </div>
</template>

<style scoped>
.month-picker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
