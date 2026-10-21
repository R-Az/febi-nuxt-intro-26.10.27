/** 管理者による勤怠の削除 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const user = await getEmployeeOr404(getRouterParam(event, 'userId') ?? '')
  const date = assertDate(getRouterParam(event, 'date'))
  if (!(await deleteRecord(user.id, date))) {
    throw createError({ statusCode: 404, message: 'この日の勤怠はありません。' })
  }
  return { ok: true }
})
