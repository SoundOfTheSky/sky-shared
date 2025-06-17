import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

import { DatabaseConnector, DefaultSchema } from '@/sky-shared/database'
import { DBString, GetTypeFromCompiled } from '@/sky-shared/type-checker'

// === Types ===
export enum UserStatus {
  DEFAULT = 0,
  BANNED = 1,
}

export type User = DefaultSchema & {
  username: string
  permissions: string[]
  status: UserStatus
}

export const UserT = TypeCompiler.Compile(
  Type.Object({
    username: Type.String({
      pattern: '/^[a-z0-9_-]{3,16}$/',
    }),
    password: DBString(),
  }),
)

export type UserDTO = GetTypeFromCompiled<typeof UserT>

// === Service ===
export class UserService {
  public constructor(protected database: DatabaseConnector<User>) {}

  public login(data: UserDTO): Promise<void> {
    throw new Error('Not implemented')
  }

  public register(data: UserDTO): Promise<void> {
    throw new Error('Not implemented')
  }

  public me(_id: string): Promise<User | undefined> {
    throw new Error('Not implemented')
  }
}
