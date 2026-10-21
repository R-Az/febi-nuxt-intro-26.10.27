export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return listUsersByRole('employee')
})
