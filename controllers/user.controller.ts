import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

import {
  APIMappableHandlerOptions,
  NotFoundError,
} from '@/sky-shared/api-mappable'
import {
  DatabaseConnector,
  DefaultSchema,
  QueryKeys,
} from '@/sky-shared/database'
import { assertPermissions } from '@/sky-shared/session'
import {
  assertType,
  TypeString,
  GetTypeFromCompiled,
  hasID,
  TypeDefaults,
} from '@/sky-shared/type-checker'

export enum UserStatus {
  DEFAULT = 0,
  BANNED = 1,
}

export type User = DefaultSchema & {
  username: string
  permissions: string[]
  status: UserStatus
}

export const UserCreateT = TypeCompiler.Compile(
  Type.Intersect([
    Type.Partial(TypeDefaults()),
    Type.Object({
      username: Type.RegExp(/^[a-z0-9_-]{3,16}$/i),
      password: TypeString(),
    }),
  ]),
)
export type UserCreateDTO = GetTypeFromCompiled<typeof UserCreateT>

export class UserController<U extends User = User> {
  public constructor(protected database: DatabaseConnector<U>) {}

  public async delete({ parameters, session }: APIMappableHandlerOptions) {
    assertPermissions(session)
    const _id = parameters?.user
    if (!_id) throw new NotFoundError()
    const item = await this.database.get(_id)
    if (!item) throw new NotFoundError()
    if (item._id !== session._id) assertPermissions(session, ['ADMIN'])
    return this.database.delete(_id)
  }

  public async get({ parameters, session }: APIMappableHandlerOptions) {
    assertPermissions(session)
    const _id = parameters?.user
    if (!_id) throw new NotFoundError()
    const item = await this.database.get(_id)
    if (
      !item ||
      (item._id !== session._id && !session.permissions.includes('ADMIN'))
    )
      throw new NotFoundError()
    return item
  }

  public getAll({ query = {}, session }: APIMappableHandlerOptions) {
    assertPermissions(session, ['ADMIN'])
    return this.database.getAll(query as QueryKeys<U>)
  }

  public async update({
    parameters,
    session,
    body,
  }: APIMappableHandlerOptions) {
    assertPermissions(session)
    const _id = parameters?.user
    if (!_id) throw new NotFoundError()
    assertType(UserCreateT, body)
    const existing = await this.database.get(_id)
    if (!existing) throw new NotFoundError()
    if (existing._id !== session._id) assertPermissions(session, ['ADMIN'])
    await this.database.update(_id, {
      username: body.username,
      updated: body.updated ?? new Date(),
    } as U)
  }

  /** If body without _id then it's login. Otherwise register. Returns signed token. */
  public async create({ body }: APIMappableHandlerOptions): Promise<string> {
    assertType(UserCreateT, body)
    const [exists] = await this.database.getAll({
      'username=': body.username,
    } as QueryKeys<U>)
    if (exists) return 'OFFLINE_TOKEN'
    if (!hasID(body)) throw new NotFoundError()
    await this.database.create({
      _id: body._id,
      created: body.created ?? new Date(),
      updated: body.updated ?? new Date(),
      username: body.username,
      permissions: [],
      status: UserStatus.DEFAULT,
    } as unknown as U)
    return 'OFFLINE_TOKEN'
  }
}
