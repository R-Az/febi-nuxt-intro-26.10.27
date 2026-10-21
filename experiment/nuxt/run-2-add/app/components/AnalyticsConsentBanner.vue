<script setup lang="ts">
const { consent, grant, deny } = useAnalytics()
</script>

<template>
  <div
    v-if="consent === null"
    class="fixed inset-x-0 bottom-0 z-50 p-4"
    role="region"
    aria-label="アクセス解析への同意"
  >
    <UCard class="mx-auto max-w-3xl shadow-lg">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p class="flex-1 text-sm">
          サービス改善のため、Google Analytics で利用状況（表示した画面や打刻の操作）を計測します。同意いただいた場合だけ計測します。
        </p>
        <div class="flex shrink-0 gap-2">
          <UButton color="neutral" variant="outline" label="同意しない" @click="deny" />
          <UButton label="同意する" @click="grant" />
        </div>
      </div>
    </UCard>
  </div>
</template>
