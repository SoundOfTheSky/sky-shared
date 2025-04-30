import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { RequiredKey } from '@softsky/utils'

import { TableDefaults } from '@/sky-shared/database'
import {
  DBNumber,
  DBString,
  GetTypeFromCompiled,
} from '@/sky-shared/type-checker'

// === Storage ===
export const UserStorageT = TypeCompiler.Compile(
  Type.Object({
    userId: Type.Optional(DBNumber()),
    used: DBNumber(),
    capacity: DBNumber(),
  }),
)
export type UserStorageDTO = GetTypeFromCompiled<typeof UserStorageT>
export type UserStorage = TableDefaults & RequiredKey<UserStorageDTO, 'userId'>

// === File ===
export enum StorageFileStatus {
  NOT_UPLOADED = 0,
  DEFAULT = 1,
  FOLDER = 2,
}
export const StorageFileT = TypeCompiler.Compile(
  Type.Object({
    userId: Type.Optional(DBNumber()),
    size: DBNumber(),
    path: DBString(0),
    name: DBString(),
    hash: Type.Optional(DBString()),
    status: Type.Enum({ NOT_UPLOADED: 0, DEFAULT: 1, FOLDER: 2 }),
  }),
)
export type StorageFileDTO = GetTypeFromCompiled<typeof StorageFileT>
export type StorageFile = TableDefaults & RequiredKey<StorageFileDTO, 'userId'>
