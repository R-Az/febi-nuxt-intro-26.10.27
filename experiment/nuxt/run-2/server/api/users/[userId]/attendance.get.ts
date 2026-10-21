// 従業員の月別勤怠。本人か管理者だけが見られる
export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'userId')!
  await requireSelfOrAdmin(event, userId)
  const month = parseMonth(getQuery(event).month)
  const employee = await getEmployeeOrThrow(userId)
  return buildMonthlyAttendance(employee, month)
})
