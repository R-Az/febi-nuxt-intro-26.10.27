/** $fetch のエラーから、サーバーが返した日本語のメッセージを取り出す */
export function getErrorMessages(error: unknown): string[] {
  const data = (error as { data?: { message?: string, data?: { errors?: string[] } } } | null)?.data
  if (data?.data?.errors?.length) return data.data.errors
  if (data?.message) return [data.message]
  return ['通信に失敗しました。時間をおいてもう一度お試しください。']
}
