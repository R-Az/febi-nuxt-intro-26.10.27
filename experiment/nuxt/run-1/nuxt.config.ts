export default defineNuxtConfig({
  modules: ['nuxt-auth-utils'],
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { lang: 'ja' },
      title: '勤怠管理',
    },
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    session: {
      // 1日の勤務中にログインが切れないよう 12 時間
      maxAge: 60 * 60 * 12,
    },
  },
  compatibilityDate: '2026-10-01',
  nitro: {
    experimental: {
      tasks: true,
    },
    // 毎日0時に前日の打刻漏れを検出する。0時が日本時間になるよう server/plugins/timezone.ts で TZ を固定している
    scheduledTasks: {
      '0 0 * * *': ['attendance:detect-missing'],
    },
  },
  typescript: {
    typeCheck: false,
  },
})
