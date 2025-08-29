// === Types ===

import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { getNextCron, inRange } from '@softsky/utils'

import { SimpleController } from '@/sky-shared/controllers/simple.controller'
import {
  DatabaseConnector,
  DefaultSchema,
  getDefaultFields,
} from '@/sky-shared/database'
import {
  GetTypeFromCompiled,
  TypeDefaults,
  TypeNumber,
  TypeString,
} from '@/sky-shared/type-checker'

export enum PlanEventStatus {
  DEFAULT = 0,
  DONE = 1,
  FAILED = 2,
  SKIPPED = 3,
}

export type PlanEvent = DefaultSchema & {
  user: string // owner
  title: string
  description?: string
  repeat?: string // cron/minutes intervals separated by comma
  start?: Date // no start means always active
  end?: Date
  duration?: number // Minutes (next repeat can't be inside duration)
  pomodoro?: boolean // Is used in pomodoro
  reward?: number // Money
  punishment?: number // Money
}

export type PlanEventOccurance = DefaultSchema & {
  user: string
  planEvent: string
  start: Date
  status: PlanEventStatus
}

export type PlanEventDTO = GetTypeFromCompiled<typeof PlanEventT>
export type PlanEventOccuranceDTO = GetTypeFromCompiled<
  typeof PlanEventOccuranceT
>

export const PlanEventT = TypeCompiler.Compile(
  Type.Intersect([
    Type.Partial(TypeDefaults()),
    Type.Object({
      user: TypeString(30),
      title: TypeString(),
      description: Type.Optional(TypeString()),
      repeat: Type.Optional(Type.String()),
      start: Type.Optional(Type.Date()),
      end: Type.Optional(Type.Date()),
      duration: Type.Optional(TypeNumber()),
      pomodoro: Type.Optional(Type.Boolean()),
      reward: Type.Optional(TypeNumber()),
      punishment: Type.Optional(TypeNumber()),
    }),
  ]),
)

export const PlanEventOccuranceT = TypeCompiler.Compile(
  Type.Intersect([
    Type.Partial(TypeDefaults()),
    Type.Object({
      user: TypeString(30),
      planEvent: TypeString(),
      start: Type.Date(),
      status: Type.Enum(PlanEventStatus),
    }),
  ]),
)

export class PlanEventController extends SimpleController<PlanEvent> {
  public constructor(database: DatabaseConnector<PlanEvent>) {
    super(database, PlanEventT, ['PLAN'])
  }

  public generateOccurance(
    planEvent: PlanEvent,
    start = new Date(),
  ): PlanEventOccurance {
    return {
      ...getDefaultFields(),
      planEvent: planEvent._id,
      status: PlanEventStatus.DEFAULT,
      user: planEvent.user,
      start,
    }
  }

  /** Start must correlate with last another occurance */
  public generateOccurances(
    planEvent: PlanEvent,
    start: Date,
    end: Date,
  ): PlanEventOccurance[] {
    if (!planEvent.repeat)
      return !planEvent.start ||
        inRange(planEvent.start.getTime(), start.getTime(), end.getTime())
        ? [this.generateOccurance(planEvent, planEvent.start)]
        : []
    if (!planEvent.start) throw new Error('Plan event has no start')
    let date = new Date(planEvent.start)
    const events = [this.generateOccurance(planEvent, date)]
    while (date.getTime() < end.getTime()) {
      date = planEvent.repeat.includes(' ')
        ? getNextCron(planEvent.repeat, date)
        : new Date(
            date.setMinutes(
              date.getMinutes() + Number.parseInt(planEvent.repeat),
            ),
          )
      events.push(this.generateOccurance(planEvent, date))
    }
    return events
  }
}

export class PlanEventOccuranceController extends SimpleController<PlanEventOccurance> {
  public constructor(database: DatabaseConnector<PlanEventOccurance>) {
    super(database, PlanEventOccuranceT, ['PLAN'])
  }
}
