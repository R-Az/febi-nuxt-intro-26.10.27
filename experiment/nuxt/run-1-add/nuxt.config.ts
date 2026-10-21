export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/scripts', 'nuxt-auth-utils'],
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { lang: 'ja' },
      title: '勤怠管理',
    },
  },
  css: ['~/assets/css/main.css'],
  // ダークモードの切り替え（Nuxt UI が @nuxtjs/color-mode を組み込んでいる）。初期値は OS の設定に合わせる
  colorMode: {
    preference: 'system',
    fallback: 'light',
  },
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
  eslint: {
    config: {
      // 既存のコードの書き方（セミコロンなし、シングルクォート、2スペース）に合わせる
      stylistic: true,
    },
  },
  // 本文の書体。Google Fonts から取得して自分のサーバーから配信する（@nuxt/fonts。Nuxt UI が組み込んでいる）
  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
    },
  },
  scripts: {
    registry: {
      // 測定ID は NUXT_PUBLIC_SCRIPTS_GOOGLE_ANALYTICS_ID で上書きできる。
      // trigger を書かないので、ここでは読み込まない。読み込みは app/plugins/analytics.client.ts で、同意を得てから行う
      // proxy・bundle は使わず、gtag.js の読み込みも計測の送信も Google に直接行う（GA の標準の構成）
      googleAnalytics: {
        id: 'G-XXXXXXXXXX',
        proxy: false,
        bundle: false,
      },
    },
  },
})
