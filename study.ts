import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

import { TableDefaults } from './database'
import {
  TypeNumber,
  DBOptional,
  TypeString,
  TypeStringArray,
  GetTypeFromCompiled,
} from './type-checker'

export const srs = [2, 4, 8, 23, 47, 167, 335, 719, 2879]

// === Themes ===
export const StudyThemeT = TypeCompiler.Compile(
  Type.Object({
    title: TypeString(),
  }),
)
export type StudyDisabledTheme = TableDefaults & {
  title: string
}
export type StudyEnabledTheme = StudyDisabledTheme & {
  lessons: number[]
  reviews: Record<string, number[]>
}
export type StudyTheme = StudyDisabledTheme | StudyEnabledTheme
export type StudyThemeDTO = GetTypeFromCompiled<typeof StudyThemeT>

// === Subjects ===
export const StudySubjectT = TypeCompiler.Compile(
  Type.Object({
    title: TypeString(),
    themeId: TypeNumber(),
  }),
)
export type StudySubjectDTO = GetTypeFromCompiled<typeof StudySubjectT>
export type StudySubject = TableDefaults &
  StudySubjectDTO & {
    questionIds: number[]
    userSubjectId?: number
  }

// === User subjects ===
export const StudyUserSubjectT = TypeCompiler.Compile(
  Type.Object({
    nextReview: DBOptional(TypeNumber()),
    stage: DBOptional(TypeNumber()),
    subjectId: TypeNumber(),
    userId: TypeNumber(),
  }),
)
export type StudyUserSubjectDTO = GetTypeFromCompiled<typeof StudyUserSubjectT>
export type StudyUserSubject = TableDefaults & StudyUserSubjectDTO

// === Questions ===
export const StudyQuestionT = TypeCompiler.Compile(
  Type.Object({
    alternateAnswers: DBOptional(
      Type.Record(TypeString(), TypeString(), {
        minProperties: 0,
        maxProperties: 8,
      }),
    ),
    answers: TypeStringArray(),
    choose: DBOptional(Type.Boolean()),
    description: TypeString(1, 2048),
    question: TypeString(1, 2048),
    subjectId: TypeNumber(),
  }),
)
export type StudyQuestionDTO = GetTypeFromCompiled<typeof StudyQuestionT>
export type StudyQuestion = TableDefaults &
  StudyQuestionDTO & {
    userQuestionId?: number
  }

// === User questions ===
export const StudyUserQuestionT = TypeCompiler.Compile(
  Type.Object({
    note: DBOptional(TypeString()),
    questionId: TypeNumber(),
    synonyms: DBOptional(TypeStringArray()),
    userId: TypeNumber(),
  }),
)
export type StudyUserQuestionDTO = GetTypeFromCompiled<
  typeof StudyUserQuestionT
>
export type StudyUserQuestion = TableDefaults & StudyUserQuestionDTO

// === Study answers ===
export const StudyAnswerT = TypeCompiler.Compile(
  Type.Object({
    answers: DBOptional(TypeStringArray()),
    correct: Type.Boolean(),
    created: TypeString(),
    subjectId: TypeNumber(),
    took: TypeNumber(),
    userId: TypeNumber(),
  }),
)
export type StudyAnswerDTO = GetTypeFromCompiled<typeof StudyAnswerT>
export type StudyAnswer = {
  id: number
  themeId: number
  updated: string
} & StudyAnswerDTO
