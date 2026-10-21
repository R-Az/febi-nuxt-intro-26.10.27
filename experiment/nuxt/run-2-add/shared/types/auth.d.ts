import type { Role } from './attendance'

declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email: string
    role: Role
  }
}

export {}
