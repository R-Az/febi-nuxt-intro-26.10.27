// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', 'nuxt-auth-utils', 'nuxt-gtag'],
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: { lang: 'ja' },
      title: '勤怠管理',
    },
  },
  css: ['~/assets/main.css'],
  compatibilityDate: '2025-07-15',
  nitro: {
    experimental: {
      tasks: true,
    },
    // 毎日 0:00（日本時間）に前日の打刻漏れを検出する。
    // Nitro のスケジューラはサーバーのローカル時刻で動くため、
    // server/plugins/timezone.ts で TZ を Asia/Tokyo に固定している。
    scheduledTasks: {
      '0 0 * * *': ['attendance:detect-missing'],
    },
  },
  typescript: {
    strict: true,
  },
  eslint: {
    config: {
      // 既存コードの書き方（セミコロンなし・シングルクォート・2スペース）に合わせる
      stylistic: true,
    },
  },
  // Google Analytics。利用者が同意するまでは gtag.js を読み込まない（manual）。
  // 同意後の読み込みは app/plugins/analytics.client.ts で行う。
  gtag: {
    id: 'G-XXXXXXXXXX',
    initMode: 'manual',
  },
})
