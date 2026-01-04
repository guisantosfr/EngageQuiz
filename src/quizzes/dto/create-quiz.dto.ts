import { QuestionType } from '../../../generated/prisma/client';
import { CreateOptionDto } from './create-option.dto';

export class CreateQuestionDto {
  text: string;
  type: QuestionType;
  timeLimit: QuestionTimeLimit;
  options: CreateOptionDto[];
  correctTrueFalse?: boolean; // só usado para questões true_false
}

export class CreateQuizDto {
  title: string;
  description?: string;
  questions: CreateQuestionDto[];
}

export enum QuestionTimeLimit {
  SECONDS_15 = 'SECONDS_15',
  SECONDS_30 = 'SECONDS_30',
  SECONDS_45 = 'SECONDS_45',
  SECONDS_60 = 'SECONDS_60',
}