import type { Role } from '#shared/types/attendance'

export function homePath(role: Role | undefined): string {
  return role === 'admin' ? '/admin' : '/punch'
}
