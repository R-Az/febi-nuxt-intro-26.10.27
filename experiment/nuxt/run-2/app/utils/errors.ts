/** API のエラーから、画面に出すメッセージを取り出す */
export function errorMessages(error: unknown, fallback = '処理に失敗しました。時間をおいて、もう一度お試しください。'): string[] {
  const data = (error as { data?: { message?: string, data?: { errors?: string[] } } } | null)?.data
  const details = data?.data?.errors
  if (Array.isArray(details) && details.length > 0) return details
  if (typeof data?.message === 'string' && data.message !== '') return [data.message]
  return [fallback]
}
