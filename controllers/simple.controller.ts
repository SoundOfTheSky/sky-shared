import { TSchema } from '@sinclair/typebox'
import { TypeCheck } from '@sinclair/typebox/compiler'

import {
  APIMappableHandlerOptions,
  NotFoundError,
} from '@/sky-shared/api-mappable'
import {
  DatabaseConnector,
  DefaultSchemaWithUser,
  getDefaultFields,
  QueryKeys,
} from '@/sky-shared/database'
import { assertPermissions } from '@/sky-shared/session'
import { assertType } from '@/sky-shared/type-checker'

export abstract class SimpleController<T extends DefaultSchemaWithUser> {
  public constructor(
    protected database: DatabaseConnector<T>,
    protected typeCheck: TypeCheck<TSchema>,
    protected permissions?: string[],
  ) {}

  public async create({
    body,
    session,
  }: APIMappableHandlerOptions): Promise<void> {
    assertPermissions(session, this.permissions)
    assertType(this.typeCheck, body)
    if ((body as T).user !== session._id) assertPermissions(session, ['ADMIN'])
    await this.database.create({ ...(body as T), ...getDefaultFields() })
  }

  public async update({
    parameters,
    session,
    body,
  }: APIMappableHandlerOptions) {
    assertPermissions(session, this.permissions)
    assertType(this.typeCheck, body)
    const _id = parameters?.file
    if (!_id) throw new NotFoundError()
    const existing = await this.database.get(_id)
    if (!existing) throw new NotFoundError()
    if (existing.user !== session._id) assertPermissions(session, ['ADMIN'])
    await this.database.update(_id, body as T)
  }

  public async delete({ parameters, session }: APIMappableHandlerOptions) {
    assertPermissions(session, this.permissions)
    const _id = parameters?.file
    if (!_id) throw new NotFoundError()
    const item = await this.database.get(_id)
    if (!item) throw new NotFoundError()
    if (item.user !== session._id) assertPermissions(session, ['ADMIN'])
    return this.database.delete(_id)
  }

  public async get({ parameters, session }: APIMappableHandlerOptions) {
    assertPermissions(session, this.permissions)
    const _id = parameters?.file
    if (!_id) return
    const item = await this.database.get(_id)
    if (!item) throw new NotFoundError()
    if (item.user !== session._id) assertPermissions(session, ['ADMIN'])
    return item
  }

  public getAll({ query = {}, session }: APIMappableHandlerOptions) {
    assertPermissions(session, this.permissions)
    if (!session.permissions.includes('ADMIN')) query.user = session._id
    return this.database.getAll(query as QueryKeys<T>)
  }
}
