import type { PunchAction } from '#shared/types/attendance'

export type AnalyticsConsent = 'granted' | 'denied'

const CONSENT_COOKIE = 'analytics_consent'
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

/** GA に送る打刻の種類。GA の慣習に合わせて snake_case にする */
const PUNCH_TYPES: Record<PunchAction, string> = {
  clockIn: 'clock_in',
  breakStart: 'break_start',
  breakEnd: 'break_end',
  clockOut: 'clock_out',
}

/**
 * Google Analytics の同意状態と送信。
 * 同意は Cookie に保存する（サーバー側でも読めるので、同意済みの人にバナーが一瞬出ることがない）。
 * 同意するまでは gtag.js を読み込まず、イベントも送らない。
 */
export function useAnalytics() {
  const cookie = useCookie<AnalyticsConsent | null>(CONSENT_COOKIE, {
    default: () => null,
    maxAge: ONE_YEAR_SECONDS,
    sameSite: 'lax',
  })
  const consent = useState<AnalyticsConsent | null>('analytics-consent', () => cookie.value)
  const { gtag, initialize } = useGtag()
  const nuxtApp = useNuxtApp()

  /** 同意済みなら gtag.js を読み込んで計測を始める（2回目以降は何もしない） */
  function start() {
    if (consent.value !== 'granted') return
    // initialize は内部で useHead を呼ぶので、Nuxt のコンテキスト内で実行する
    nuxtApp.runWithContext(() => initialize())
  }

  function grant() {
    cookie.value = 'granted'
    consent.value = 'granted'
    start()
  }

  function deny() {
    cookie.value = 'denied'
    consent.value = 'denied'
  }

  function trackPunch(action: PunchAction) {
    // 同意前に gtag() を呼ぶと dataLayer に溜まり、同意後にまとめて送られてしまうので呼ばない
    if (consent.value !== 'granted') return
    gtag('event', 'punch', {
      punch_type: PUNCH_TYPES[action],
      punch_label: PUNCH_ACTION_LABELS[action],
    })
  }

  return { consent: readonly(consent), grant, deny, start, trackPunch }
}
