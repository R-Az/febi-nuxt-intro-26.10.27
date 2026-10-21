<script setup lang="ts">
const month = defineModel<string>({ required: true })
</script>

<template>
  <UFieldGroup>
    <UButton color="neutral" variant="outline" icon="i-lucide-chevron-left" label="前月" aria-label="前の月" @click="month = addMonths(month, -1)" />
    <UInput v-model="month" type="month" aria-label="表示する月" required />
    <UButton color="neutral" variant="outline" trailing-icon="i-lucide-chevron-right" label="翌月" aria-label="次の月" @click="month = addMonths(month, 1)" />
  </UFieldGroup>
</template>
