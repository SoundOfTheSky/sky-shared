import { RequiredKey, ValidationError } from '@softsky/utils'

import { User } from '@/sky-shared/user.service'

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

export function checkPermissions(
  payload: SessionPayload,
  permissions: string[],
): payload is LoggedInSessionPayload {
  if (
    !payload.user ||
    permissions.some((x) => !payload.user!.permissions.includes(x))
  )
    throw new ValidationError('NOT_ALLOWED')
  return true
}
