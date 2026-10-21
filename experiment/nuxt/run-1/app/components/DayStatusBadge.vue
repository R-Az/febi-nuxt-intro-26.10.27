<script setup lang="ts">
import type { DayStatus } from '#shared/types/attendance'

defineProps<{ status: DayStatus }>()
</script>

<template>
  <span
    v-if="status === 'missing'"
    class="badge badge-warning"
  >打刻漏れ</span>
  <span
    v-else-if="status === 'in_progress'"
    class="badge badge-info"
  >勤務中</span>
</template>
