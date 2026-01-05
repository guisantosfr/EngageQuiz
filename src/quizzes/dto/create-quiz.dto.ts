import { QuestionType } from '../../../generated/prisma/client';
import { CreateOptionDto } from './create-option.dto';

export class CreateQuestionDto {
  text: string;
  type: QuestionType;
  timeLimit: Number;
  options: CreateOptionDto[];
  correctAnswer?: boolean; // só usado para questões true_false
}

export class CreateQuizDto {
  title: string;
  description?: string;
  questions: CreateQuestionDto[];
}