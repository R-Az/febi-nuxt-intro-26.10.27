import { currentMonth, isValidMonthString } from '#shared/utils/time'

/** URL の ?month= と同期する月（YYYY-MM）。省略・不正なら今月 */
export function useMonthQuery() {
  const route = useRoute()
  const router = useRouter()
  return computed<string>({
    get: () => (isValidMonthString(route.query.month) ? route.query.month : currentMonth()),
    set: (month) => {
      router.replace({ query: { ...route.query, month } })
    },
  })
}
