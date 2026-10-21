<script setup lang="ts">
import { ja } from '@nuxt/ui/locale'
</script>

<template>
  <!-- Nuxt UI の部品（モーダル、ボタンの読み上げ用ラベルなど）を日本語にする -->
  <UApp :locale="ja">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AnalyticsConsentBanner />
  </UApp>
</template>
