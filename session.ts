import { NotAllowedError } from '@/sky-shared/api-mappable'
import { User } from '@/sky-shared/controllers/user.controller'

export type SessionPayload = Pick<User, '_id' | 'status' | 'permissions'> & {
  sub: string // JWT ID
  iat: number // Issued at
  exp: number // Exprires at
  version: number // Delete if changed
}

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
  session: SessionPayload | undefined,
  permissions?: string[],
): asserts session is SessionPayload {
  if (!session || permissions?.some((x) => !session.permissions.includes(x)))
    throw new NotAllowedError()
}
