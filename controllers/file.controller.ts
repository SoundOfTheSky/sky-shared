import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ValidationError } from '@softsky/utils'

import {
  APIMappableHandlerOptions,
  NotFoundError,
} from '@/sky-shared/api-mappable'
import {
  DatabaseConnector,
  DefaultSchema,
  getDefaultFields,
  QueryKeys,
} from '@/sky-shared/database'
import { assertPermissions } from '@/sky-shared/session'
import {
  assertType,
  DBNumber,
  DBString,
  GetTypeFromCompiled,
} from '@/sky-shared/type-checker'

// === Types ===

export enum FileStatus {
  NOT_UPLOADED = 0,
  DEFAULT = 1,
  FOLDER = 2,
}

export type File = DefaultSchema & {
  userId: string
  size: number
  path: string
  name: string
  hash?: string
  status: FileStatus
}

export const FileT = TypeCompiler.Compile(
  Type.Object({
    userId: DBString(),
    size: DBNumber(),
    path: DBString(0),
    name: DBString(),
    hash: Type.Optional(DBString()),
    status: Type.Enum({ NOT_UPLOADED: 0, DEFAULT: 1, FOLDER: 2 }),
  }),
)

export type FileDTO = GetTypeFromCompiled<typeof FileT>

// === Service ===
export abstract class FileController {
  public constructor(protected database: DatabaseConnector<File>) {}

  public async create({
    body,
    session,
  }: APIMappableHandlerOptions): Promise<void> {
    assertPermissions(session, ['FILES'])
    assertType(FileT, body)
    if (body.userId !== session._id) assertPermissions(session, ['ADMIN'])
    body.status = await this.getStatusByHash(body.hash)
    await this.createFoldersForPath(
      body.userId,
      body.path ? body.path.split('/') : [],
    )
    await this.database.create({ ...body, ...getDefaultFields() })
  }

  public async update({
    parameters,
    session,
    body,
  }: APIMappableHandlerOptions) {
    assertPermissions(session, ['FILES'])
    const _id = parameters?.file
    if (!_id) throw new NotFoundError()
    if (!FileT.Check(body))
      throw new ValidationError(JSON.stringify([...FileT.Errors(body)]))
    const existing = await this.database.get(_id)
    if (!existing) throw new NotFoundError()
    if (existing.userId !== session._id) assertPermissions(session, ['ADMIN'])
    if (body.hash !== existing.hash) {
      body.status = await this.getStatusByHash(existing.hash)
      await this.deleteBinaryIfOneLeft(existing.hash)
    }
    if (existing.path !== body.path)
      await this.createFoldersForPath(
        existing.userId,
        existing.path ? existing.path.split('/') : [],
      )
    await this.database.update(_id, body)
  }

  public async delete({ parameters, session }: APIMappableHandlerOptions) {
    assertPermissions(session, ['FILES'])
    const _id = parameters?.file
    if (!_id) throw new NotFoundError()
    const item = await this.database.get(_id)
    if (!item) throw new NotFoundError()
    if (item.userId !== session._id) assertPermissions(session, ['ADMIN'])
    if (item.status === FileStatus.FOLDER)
      for (const file of await this.database.getAll({
        'path=': `${item.path}/${item.name}`,
        'userId=': session._id,
      }))
        await this.delete({
          session,
          parameters: { _id: file._id },
        })
    await this.deleteBinaryIfOneLeft(item.hash)
    return this.database.delete(_id)
  }

  public async get({ parameters, session }: APIMappableHandlerOptions) {
    assertPermissions(session, ['FILES'])
    const _id = parameters?.file
    if (!_id) return
    const item = await this.database.get(_id)
    if (
      !item ||
      (item.userId !== session._id && !session.permissions.includes('ADMIN'))
    )
      return
    return item
  }

  public getAll({ query = {}, session }: APIMappableHandlerOptions) {
    assertPermissions(session, ['FILES'])
    if (!session.permissions.includes('ADMIN')) query.userId = session._id
    return this.database.getAll(query as QueryKeys<File>)
  }

  public async uploadBinary({
    session,
    body,
    parameters,
  }: APIMappableHandlerOptions<ReadableStream<Uint8Array>>) {
    assertPermissions(session, ['FILES'])
    const hash = parameters?.file
    if (!hash) throw new ValidationError('WRONG_HASH')
    let calculatedHash = ''
    const temporaryName = '_' + hash
    try {
      const result = await Promise.all([
        this.calcHash(body),
        this.writeFile(temporaryName, body),
      ])
      calculatedHash = result[0]
    } finally {
      if (hash === calculatedHash) {
        await this.writeFile(hash, await this.readFile(temporaryName))
        await this.database.updateMany(
          {
            'hash=': hash,
          },
          {
            status: FileStatus.DEFAULT,
          },
        )
      }
      await this.deleteFile(temporaryName)
    }
  }

  protected async createFoldersForPath(userId: string, path: string[]) {
    let p = ''
    for (let index = 0; index < path.length; index++) {
      const folder = path[index]!
      if (
        await this.database
          .getAll({
            'path=': p,
            'name=': folder,
            'userId=': userId,
          })
          .then((x) => x.length === 0)
      )
        await this.database.create({
          ...getDefaultFields(),
          name: folder,
          path: p,
          userId,
          size: 0,
          status: FileStatus.FOLDER,
        })
      p += '/' + folder
    }
  }

  protected getStatusByHash(hash?: string) {
    if (!hash) return FileStatus.FOLDER
    return this.database
      .getAll({
        'hash=': hash,
        'status=': FileStatus.DEFAULT,
      })
      .then((x) =>
        x.length === 0 ? FileStatus.NOT_UPLOADED : FileStatus.DEFAULT,
      )
  }

  protected async deleteBinaryIfOneLeft(hash?: string) {
    if (!hash) return
    const existingByHash = await this.database.getAll({
      'hash=': hash,
      'status=': FileStatus.DEFAULT,
    })
    if (existingByHash.length === 1) await this.deleteFile(hash)
  }

  protected abstract calcHash(
    stream: ReadableStream<Uint8Array>,
  ): Promise<string>
  protected abstract writeFile(
    hash: string,
    stream: ReadableStream<Uint8Array>,
  ): Promise<void>
  protected abstract deleteFile(hash: string): Promise<void>
  protected abstract readFile(hash: string): Promise<ReadableStream<Uint8Array>>
}
