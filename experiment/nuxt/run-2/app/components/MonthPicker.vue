<script setup lang="ts">
const month = defineModel<string>({ required: true })
</script>

<template>
  <div class="month-picker">
    <button type="button" class="btn" aria-label="前の月" @click="month = addMonths(month, -1)">‹ 前月</button>
    <input v-model="month" type="month" aria-label="表示する月" required>
    <button type="button" class="btn" aria-label="次の月" @click="month = addMonths(month, 1)">翌月 ›</button>
  </div>
</template>
