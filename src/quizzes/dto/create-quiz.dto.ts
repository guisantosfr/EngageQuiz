import { QuestionType } from '../../../generated/prisma/client';

export class CreateQuestionDto {
  text: string;
  type: QuestionType;
}

export class CreateQuizDto {
  title: string;
  description?: string;
  questions: CreateQuestionDto[];
}
