<script setup lang="ts">
import type { DayStatus } from '#shared/types/attendance'

defineProps<{ status: DayStatus }>()
</script>

<template>
  <UBadge
    v-if="status === 'missing'"
    color="warning"
    variant="subtle"
  >
    打刻漏れ
  </UBadge>
  <UBadge
    v-else-if="status === 'in_progress'"
    color="info"
    variant="subtle"
  >
    勤務中
  </UBadge>
</template>
