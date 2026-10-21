// Google Analytics の読み込み（@nuxt/scripts）。
// - 同意するまでは gtag.js を読み込まないので、計測の送信も Cookie の保存も起きない
// - 同意したら、画面の表示が終わってから（onNuxtReady）async で読み込むので、最初の表示を妨げない
// - 測定ID は nuxt.config.ts の scripts.registry.googleAnalytics.id
export default defineNuxtPlugin(() => {
  const { consent } = useAnalyticsConsent()
  const granted = computed(() => consent.value === 'granted')
  const measurementId = useRuntimeConfig().public.scripts?.googleAnalytics?.id

  const { proxy } = useScriptGoogleAnalytics({
    scriptOptions: {
      trigger: useScriptTriggerConsent({ consent: granted, postConsentTrigger: 'onNuxtReady' }),
    },
  })

  // 一度同意したあとで「同意しない」に変えた場合は、Google の公式のオプトアウト用フラグで送信を止める
  watch(granted, (value) => {
    if (measurementId) (window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] = !value
  }, { immediate: true })

  return {
    provide: {
      trackEvent(name: string, params?: Record<string, unknown>) {
        // 同意前のイベントは貯めておかずに捨てる（同意したあとでまとめて送られないように）
        if (!granted.value) return
        proxy.gtag('event', name, params)
      },
    },
  }
})
