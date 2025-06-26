import { Static, TSchema, Type } from '@sinclair/typebox'
import {
  TypeCheck,
  ValueError,
  ValueErrorIterator,
} from '@sinclair/typebox/compiler'
import { ValidationError } from '@softsky/utils'

export type GetTypeFromCompiled<C extends TypeCheck<TSchema>> =
  C extends TypeCheck<infer T> ? Static<T> : unknown

export const TypeString = (min = 1, max = 255) =>
  Type.String({
    minLength: min,
    maxLength: max,
  })

export const TypeNumber = () =>
  Type.Number({
    minimum: 0,
    maximum: Number.MAX_SAFE_INTEGER,
  })

export const TypeDate = () =>
  Type.Date({
    minimumTimestamp: 0,
    maximumTimestamp: Number.MAX_SAFE_INTEGER,
  })

export const TypeStringArray = (min = 0, max = 8) =>
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
export const TypeDefaults = () =>
  Type.Object({
    _id: TypeString(30),
    created: TypeDate(),
    updated: TypeDate(),
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
