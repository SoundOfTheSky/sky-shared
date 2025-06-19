import { Static, TSchema, Type } from '@sinclair/typebox'
import {
  TypeCheck,
  ValueError,
  ValueErrorIterator,
} from '@sinclair/typebox/compiler'
import { ValidationError } from '@softsky/utils'

export type GetTypeFromCompiled<C extends TypeCheck<TSchema>> =
  C extends TypeCheck<infer T> ? Static<T> : unknown

export const DBString = (min = 1, max = 255) =>
  Type.String({
    minLength: min,
    maxLength: max,
  })

export const DBNumber = () =>
  Type.Number({
    minimum: 0,
    maximum: Number.MAX_SAFE_INTEGER,
  })

export const DBDate = () =>
  Type.Date({
    minimumTimestamp: 0,
    maximumTimestamp: Number.MAX_SAFE_INTEGER,
  })

export const DBStringArray = (min = 0, max = 8) =>
  Type.Array(
    Type.String({
      minLength: 1,
      maxLength: 255,
    }),
    {
      minItems: min,
      maxItems: max,
    },
  )
export const DBDefaults = () =>
  Type.Object({
    id: Type.String(),
    created: DBDate(),
    updated: DBDate(),
  })

export class TypeCheckerError extends ValidationError {
  public errors: ValueError[]
  public constructor(data: ValueErrorIterator) {
    const errors = [...data]
    super(errors.map((x) => `${x.path} ${x.message}`).join('\n'))
    this.errors = [...data]
  }
}

export function hasID(body: unknown): body is { _id: string } {
  return (
    body !== null &&
    typeof body === 'object' &&
    '_id' in body &&
    typeof body._id === 'string' &&
    body._id.length === 30
  )
}

export function assertType<T extends TSchema>(
  T: TypeCheck<T>,
  value: unknown,
): asserts value is Static<T> {
  if (!T.Check(value)) throw new TypeCheckerError(T.Errors(value))
}
