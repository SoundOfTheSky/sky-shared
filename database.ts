import { UUID } from '@softsky/utils'

export type DefaultSchema = {
  _id: string
  created: Date
  updated: Date
}

export type QuerySuffix = '=' | '<' | '>'

export type QueryKeys<T> = {
  [K in keyof T & string as `${K}${QuerySuffix}`]?: T[K]
}

export type DatabaseConnector<T extends DefaultSchema> = {
  get: (_id: string) => Promise<T | undefined>
  create: (data: T) => Promise<void>
  createMany: (data: T[]) => Promise<void>
  delete: (_id: string) => Promise<void>
  deleteMany: (query: QueryKeys<T>) => Promise<void>
  cursor: (query: QueryKeys<T>) => AsyncGenerator<T>
  getAll: (query: QueryKeys<T>) => Promise<T[]>
  update: (_id: string, fields: Partial<T>) => Promise<void>
  updateMany: (query: QueryKeys<T>, fields: Partial<T>) => Promise<void>
}

export function getDefaultFields(): DefaultSchema {
  return {
    _id: UUID(),
    created: new Date(),
    updated: new Date(),
  }
}
