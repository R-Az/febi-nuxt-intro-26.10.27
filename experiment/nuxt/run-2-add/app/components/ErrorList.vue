<script setup lang="ts">
defineProps<{ messages: string[] }>()
</script>

<template>
  <UAlert
    v-if="messages.length > 0"
    color="error"
    variant="subtle"
    icon="i-lucide-circle-alert"
    role="alert"
  >
    <template #description>
      <p v-for="m in messages" :key="m">
        {{ m }}
      </p>
    </template>
  </UAlert>
</template>
