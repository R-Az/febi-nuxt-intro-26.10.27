<script setup lang="ts">
defineProps<{ messages: string[] }>()
</script>

<template>
  <div v-if="messages.length > 0" class="alert alert-error" role="alert">
    <p v-for="m in messages" :key="m">{{ m }}</p>
  </div>
</template>
