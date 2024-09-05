import { Static, TSchema, Type } from '@sinclair/typebox';
import { TypeCheck } from '@sinclair/typebox/compiler';

export type GetTypeFromCompiled<C extends TypeCheck<TSchema>> = C extends TypeCheck<infer T> ? Static<T> : unknown;
export const DBString = (min = 1, max = 255) =>
  Type.String({
    minLength: min,
    maxLength: max,
  });

export const DBNumber = () =>
  Type.String({
    minimum: 0,
    maximum: Number.MAX_SAFE_INTEGER,
  });

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
  );
