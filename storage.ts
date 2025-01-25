import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

import { TableDefaults } from '@/sky-shared/database'
import { DBNumber, DBString, GetTypeFromCompiled } from '@/sky-shared/type-checker'

// === Storage ===
export const UserStorageT = TypeCompiler.Compile(
  Type.Object({
    userId: DBNumber(),
    used: DBNumber(),
    capacity: DBNumber(),
  }),
)
export type UserStorageDTO = GetTypeFromCompiled<typeof UserStorageT>
export type UserStorage = TableDefaults & UserStorageDTO

// === File ===
export enum StorageFileStatus {
  NOT_UPLOADED = 0,
  DEFAULT = 1,
}
export const StorageFileT = TypeCompiler.Compile(
  Type.Object({
    userId: DBNumber(),
    size: DBNumber(),
    path: DBString(),
    hash: DBString(),
  }),
)
export type StorageFileDTO = GetTypeFromCompiled<typeof StorageFileT>
export type StorageFile = TableDefaults & StorageFileDTO & {
  status: StorageFileStatus
}
