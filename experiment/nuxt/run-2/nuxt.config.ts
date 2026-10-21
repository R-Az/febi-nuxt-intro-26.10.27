// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-auth-utils'],
  css: ['~/assets/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'ja' },
      title: '勤怠管理',
    },
  },
  typescript: {
    strict: true,
  },
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
})
