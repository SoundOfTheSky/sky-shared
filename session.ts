import { RequiredKey } from '@softsky/utils'

import { NotAllowedError } from '@/sky-shared/api-mappable'
import { User } from '@/sky-shared/controllers/user.controller'

export type SessionBody = {
  user?: Pick<User, '_id' | 'status' | 'permissions'>
  version: number
}

export type SessionPayload = SessionBody & {
  sub: string // JWT ID
  iat: number // Issued at
  exp: number // Exprires at
}

export type LoggedInSessionPayload = RequiredKey<SessionPayload, 'user'>

export function extractJWTPayload(token: string) {
  const base64 = token.split('.')[1]!.replaceAll('-', '+').replaceAll('_', '/')
  const jsonPayload = decodeURIComponent(
    globalThis
      .atob(base64)
      // eslint-disable-next-line unicorn/prefer-spread
      .split('')
      .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  )
  return JSON.parse(jsonPayload) as SessionPayload
}

export function assertPermissions(
  payload: SessionPayload,
  permissions?: string[],
): asserts payload is LoggedInSessionPayload {
  if (
    !payload.user ||
    permissions?.some((x) => !payload.user!.permissions.includes(x))
  )
    throw new NotAllowedError()
}
