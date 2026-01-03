import { QuestionType } from '../../../generated/prisma/client';

export class UpdateQuestionDto {
  id?: string; // se existir, atualiza; se não, cria
  text: string;
  type: QuestionType;
}

export class UpdateQuizDto {
  title?: string;
  description?: string;
  questions?: UpdateQuestionDto[];
}
