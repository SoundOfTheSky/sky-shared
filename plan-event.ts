import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

import { TableDefaults, TableDTO } from './db';
import { DBNumber, DBString, GetTypeFromCompiled } from './type-checker';

export enum PlanEventStatus {
  TODO = 0,
  DONE = 1,
  FAILED = 2,
  SKIPPED = 3,
}
// === Plan event ===
export const PlanEventT = TypeCompiler.Compile(
  Type.Object({
    title: DBString(),
    start: DBNumber(), // unix minutes
    duration: DBNumber(), // Minutes
    end: Type.Optional(DBNumber()), // unix minutes
    repeat: Type.Optional(DBString()), // cron or interval
    description: Type.Optional(DBString()),
    parentId: Type.Optional(DBNumber()),
  }),
);

export type PlanEvent = TableDefaults & {
  title: string;
  start: number; // unix minutes
  duration: number; // Minutes
  userId: number;
  end?: number; // unix minutes
  repeat?: string; // cron or interval
  description?: string;
  parentId?: number;
};

export type PlanEventDTO = GetTypeFromCompiled<typeof PlanEventT>;

// === Plan event occurance ===
export const PlanEventOccuranceT = TypeCompiler.Compile(
  Type.Object({
    planEventId: DBNumber(),
    start: DBNumber(), // unix minutes
    status: Type.Enum({
      TODO: 0,
      DONE: 1,
      FAILED: 2,
      SKIPPED: 3,
    }),
  }),
);

export type PlanEventOccurance = TableDefaults & {
  userId: number;
  planEventId: number;
  start: number; // unix minutes
  status: PlanEventStatus;
};

export type PlanEventOccuranceDTO = TableDTO<PlanEventOccurance>;
