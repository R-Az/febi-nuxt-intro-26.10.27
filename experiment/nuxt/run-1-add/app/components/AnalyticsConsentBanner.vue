<script setup lang="ts">
const { consent, setConsent } = useAnalyticsConsent()
</script>

<template>
  <div
    v-if="consent === null"
    class="fixed inset-x-0 bottom-0 z-50 p-4"
  >
    <UCard
      class="mx-auto max-w-3xl shadow-lg"
      role="region"
      aria-label="アクセス解析への同意"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p class="flex-1 text-sm">
          使い勝手の改善のため、Google Analytics で画面の利用状況（表示した画面、打刻の種類など）を計測します。
          同意いただいた場合だけ計測します。
        </p>
        <div class="flex shrink-0 gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="setConsent('denied')"
          >
            同意しない
          </UButton>
          <UButton @click="setConsent('granted')">
            同意する
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
