import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

import { TableDefaults } from './db';
import { DBNumber, DBString, DBStringArray, GetTypeFromCompiled } from './type-checker';

export const srs = [2, 4, 8, 23, 47, 167, 335, 719, 2879];

// === Themes ===
export const ThemeT = TypeCompiler.Compile(
  Type.Object({
    title: DBString(),
  }),
);

export type Theme = TableDefaults & {
  title: string;
};

export type UserTheme = Theme & {
  lessons: number[];
  reviews: Record<string, number[]>;
};

export type ThemeDTO = GetTypeFromCompiled<typeof ThemeT>;

// === Subjects ===
export const SubjectT = TypeCompiler.Compile(
  Type.Object({
    title: DBString(),
    themeId: DBNumber(),
  }),
);

export type Subject = TableDefaults &
  SubjectDTO & {
    title: string;
    themeId: string;
    questionIds: number[];
    userSubjectId?: number;
  };

export type SubjectDTO = GetTypeFromCompiled<typeof SubjectT>;

// === User subjects ===
export const UserSubjectT = TypeCompiler.Compile(
  Type.Object({
    subjectId: DBNumber(),
    nextReview: Type.Optional(DBNumber()),
    stage: Type.Optional(DBNumber()),
  }),
);

export type UserSubject = TableDefaults & {
  userId: number;
  subjectId: number;
  stage: number;
  nextReview?: number | null;
};

export type UserSubjectDTO = GetTypeFromCompiled<typeof UserSubjectT>;

// === Questions ===
export const QuestionT = TypeCompiler.Compile(
  Type.Object({
    answers: DBStringArray(),
    question: DBString(1, 2048),
    description: DBString(1, 2048),
    subjectId: DBNumber(),
    alternateAnswers: Type.Optional(
      Type.Record(DBString(), DBString(), {
        minProperties: 0,
        maxProperties: 8,
      }),
    ),
    choose: Type.Optional(Type.Boolean()),
  }),
);

export type Question = TableDefaults & {
  answers: string[];
  question: string;
  description: string;
  subjectId: number;
  alternateAnswers?: Record<string, string>;
  choose?: boolean;
  userQuestionId?: number;
};

export type QuestionDTO = GetTypeFromCompiled<typeof QuestionT>;

// === User questions ===
export const UserQuestionT = TypeCompiler.Compile(
  Type.Object({
    questionId: DBNumber(),
    note: Type.Optional(DBString()),
    synonyms: Type.Optional(DBStringArray()),
  }),
);

export type UserQuestion = TableDefaults & {
  userId: number;
  questionId: number;
  note?: string;
  synonyms?: string[];
};

export type UserQuestionDTO = GetTypeFromCompiled<typeof UserQuestionT>;

// === User asnwers ===
export const UserAnswerT = TypeCompiler.Compile(
  Type.Object({
    correct: Type.Boolean(),
    subjectId: DBNumber(),
    answers: DBStringArray(),
    took: DBNumber(),
  }),
);

export type UserAnswer = TableDefaults & {
  correct: boolean;
  subjectId: number;
  userId: number;
  answers: string[];
  took: number;
};

export type UserAnswerDTO = GetTypeFromCompiled<typeof UserAnswerT>;
