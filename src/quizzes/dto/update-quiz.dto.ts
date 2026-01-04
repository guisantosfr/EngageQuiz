import { QuestionType, QuestionTimeLimit } from '../../../generated/prisma/client';
import { UpdateOptionDto } from './update-option.dto';

export class UpdateQuestionDto {
  id?: string; // se existir, atualiza; se não, cria
  text: string;
  type: QuestionType;
  timeLimit: QuestionTimeLimit;
  options: UpdateOptionDto[];
  correctTrueFalse?: boolean; // só usado para questões true_false
}

export class UpdateQuizDto {
  title?: string;
  description?: string;
  questions?: UpdateQuestionDto[];
}
