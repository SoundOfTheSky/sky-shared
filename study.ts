import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

import { TableDefaults } from './db';
import { DBDate, DBNumber, DBString, DBStringArray, GetTypeFromCompiled } from './type-checker';

export const srs = [2, 4, 8, 23, 47, 167, 335, 719, 2879];

// === Themes ===
export const ThemeT = TypeCompiler.Compile(
  Type.Object({
    title: DBString(),
  }),
);
export type DisabledTheme = TableDefaults & {
  title: string;
};
export type EnabledTheme = DisabledTheme & {
  lessons: number[];
  reviews: Record<string, number[]>;
};
export type Theme = DisabledTheme | EnabledTheme;
export type ThemeDTO = GetTypeFromCompiled<typeof ThemeT>;

// === Subjects ===
export const SubjectT = TypeCompiler.Compile(
  Type.Object({
    title: DBString(),
    themeId: DBNumber(),
  }),
);
export type SubjectDTO = GetTypeFromCompiled<typeof SubjectT>;
export type Subject = TableDefaults &
  SubjectDTO & {
    questionIds: number[];
    userSubjectId?: number;
  };

// === User subjects ===
export const UserSubjectT = TypeCompiler.Compile(
  Type.Object({
    nextReview: Type.Optional(DBNumber()),
    stage: Type.Optional(DBNumber()),
    subjectId: DBNumber(),
    userId: DBNumber(),
  }),
);
export type UserSubjectDTO = GetTypeFromCompiled<typeof UserSubjectT>;
export type UserSubject = TableDefaults & UserSubjectDTO;

// === Questions ===
export const QuestionT = TypeCompiler.Compile(
  Type.Object({
    alternateAnswers: Type.Optional(
      Type.Record(DBString(), DBString(), {
        minProperties: 0,
        maxProperties: 8,
      }),
    ),
    answers: DBStringArray(),
    choose: Type.Optional(Type.Boolean()),
    description: DBString(1, 2048),
    question: DBString(1, 2048),
    subjectId: DBNumber(),
  }),
);
export type QuestionDTO = GetTypeFromCompiled<typeof QuestionT>;
export type Question = TableDefaults &
  QuestionDTO & {
    userQuestionId?: number;
  };

// === User questions ===
export const UserQuestionT = TypeCompiler.Compile(
  Type.Object({
    note: Type.Optional(DBString()),
    questionId: DBNumber(),
    synonyms: Type.Optional(DBStringArray()),
    userId: DBNumber(),
  }),
);
export type UserQuestionDTO = GetTypeFromCompiled<typeof UserQuestionT>;
export type UserQuestion = TableDefaults & UserQuestionDTO;

// === User asnwers ===
export const UserAnswerT = TypeCompiler.Compile(
  Type.Object({
    answers: DBStringArray(),
    correct: Type.Boolean(),
    created: DBDate(),
    subjectId: DBNumber(),
    took: DBNumber(),
    userId: DBNumber(),
  }),
);
export type UserAnswerDTO = GetTypeFromCompiled<typeof UserAnswerT>;
export type UserAnswer = TableDefaults & UserAnswerDTO;
