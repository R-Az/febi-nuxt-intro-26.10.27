<script setup lang="ts">
import { ja } from '@nuxt/ui/locale'
</script>

<template>
  <UApp :locale="ja">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AnalyticsConsentBanner />
  </UApp>
</template>
