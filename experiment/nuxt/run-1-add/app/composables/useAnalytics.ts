/** アクセス解析（Google Analytics）への同意。null はまだ選んでいない */
export type AnalyticsConsent = 'granted' | 'denied'

const COOKIE_NAME = 'analytics_consent'

/**
 * 同意の状態。バナーで選んだ結果は Cookie に1年間保存する。
 * Cookie なのでサーバー側の描画でも分かり、選択済みの人に一瞬バナーが見えることがない
 */
export function useAnalyticsConsent() {
  const cookie = useCookie<string | null>(COOKIE_NAME, {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  const consent = useState<AnalyticsConsent | null>('analytics-consent', () =>
    cookie.value === 'granted' || cookie.value === 'denied' ? cookie.value : null)

  function setConsent(value: AnalyticsConsent | null) {
    consent.value = value
    cookie.value = value
  }

  return { consent: readonly(consent), setConsent }
}

/** 計測イベントを送る。同意がない間は何もしない（app/plugins/analytics.client.ts） */
export function useAnalytics() {
  const nuxtApp = useNuxtApp()
  return {
    trackEvent(name: string, params?: Record<string, unknown>) {
      nuxtApp.$trackEvent?.(name, params)
    },
  }
}
