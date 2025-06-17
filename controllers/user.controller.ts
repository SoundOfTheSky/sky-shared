import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ValidationError } from '@softsky/utils'

import { APIMappableHandlerOptions } from '@/sky-shared/api-mappable'
import {
  DatabaseConnector,
  DefaultSchema,
  getDefaultFields,
  QueryKeys,
} from '@/sky-shared/database'
import { checkPermissions } from '@/sky-shared/session'
import { DBString, GetTypeFromCompiled } from '@/sky-shared/type-checker'

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

export abstract class UserController {
  public constructor(protected database: DatabaseConnector<User>) {}

  public async create({ body }: APIMappableHandlerOptions): Promise<void> {
    if (!UserT.Check(body))
      throw new ValidationError(JSON.stringify([...UserT.Errors(body)]))
    await this.database.create({
      ...body,
      ...getDefaultFields(),
      permissions: [],
      status: UserStatus.DEFAULT,
    })
  }

  public async update({
    parameters,
    session,
    body,
  }: APIMappableHandlerOptions) {
    if (!session.user) throw new ValidationError('NOT_ALLOWED')
    const _id = parameters?.user
    if (!_id) throw new ValidationError('NOT_FOUND')
    if (!UserT.Check(body))
      throw new ValidationError(JSON.stringify([...UserT.Errors(body)]))
    const existing = await this.database.get(_id)
    if (!existing) throw new ValidationError('NOT_FOUND')
    if (existing._id !== session.user._id) checkPermissions(session, ['ADMIN'])
    // Add password
    await this.database.update(_id, body)
  }

  public async delete({ parameters, session }: APIMappableHandlerOptions) {
    if (!session.user) throw new ValidationError('NOT_ALLOWED')
    const _id = parameters?.user
    if (!_id) throw new ValidationError('NOT_FOUND')
    const item = await this.database.get(_id)
    if (!item) throw new ValidationError('NOT FOUND')
    if (item._id !== session.user._id) checkPermissions(session, ['ADMIN'])
    return this.database.delete(_id)
  }

  public async get({ parameters, session }: APIMappableHandlerOptions) {
    if (!session.user) throw new ValidationError('NOT_ALLOWED')
    const _id = parameters?.user
    if (!_id) return
    const item = await this.database.get(_id)
    if (
      !item ||
      (item._id !== session.user._id &&
        !session.user.permissions.includes('ADMIN'))
    )
      return
    return item
  }

  public getAll({ query = {}, session }: APIMappableHandlerOptions) {
    checkPermissions(session, ['ADMIN'])
    return this.database.getAll(query as QueryKeys<User>)
  }
}
