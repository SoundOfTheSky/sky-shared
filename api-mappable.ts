import { ValidationError } from '@softsky/utils'

import { SessionPayload } from '@/sky-shared/session'

// NO PATCH OR OPTIONS
export type APIMappableHandlerMethods = 'GET' | 'DELETE' | 'POST' | 'PUT'
export type APIMappableHandlerOptions<T = undefined> = {
  /** User session. Decoded JWT */
  session: SessionPayload
  /** HTTP method */
  method?: APIMappableHandlerMethods
  /** URL query parameters like `?id=1&test=abc` */
  query?: Record<string, string>
  /** Path parameters like `/user/<user_id>` */
  parameters?: Record<string, string>
} & (T extends undefined ? { body?: unknown } : { body: T })

/**
 * Object that can be easily mapped to API.
 *
 * - key - path (may contain variables)
 * - method - http method
 * - body - body of request (only for POST/PUT)
 * - query - query params
 * - parameters - parsed parameters from path
 */
export type APIMappableHandler<T = undefined> = (
  data: APIMappableHandlerOptions<T>,
) => unknown

export class NotFoundError extends ValidationError {
  public override name = 'NotFound'
}

export class NotAllowedError extends ValidationError {
  public override name = 'NotAllowed'
}

export class OfflineError extends ValidationError {
  public override name = 'OfflineError'
}
