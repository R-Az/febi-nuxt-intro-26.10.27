export default defineEventHandler(async (event) => {
  const user = await requireEmployee(event)
  return getPunchStatus(user.id)
})
