import { nowInJst } from '#shared/utils/date'

/** URL の ?month= と同期する「表示中の月」。未指定なら今月 */
export function useMonthQuery() {
  const route = useRoute()
  const router = useRouter()
  return computed<string>({
    get() {
      const q = route.query.month
      return typeof q === 'string' && isValidMonth(q) ? q : nowInJst().date.slice(0, 7)
    },
    set(value) {
      router.replace({ query: { ...route.query, month: value } })
    },
  })
}
