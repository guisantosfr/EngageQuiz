import { QuestionType } from "generated/prisma/enums";

export class GetQuizDto {
  id: string;
  title: string;
  description?: string;
  questions: GetQuizQuestionDto[];
}

export class GetQuizQuestionDto {
  id: string;
  text: string;
  type: QuestionType;
  timeLimit: number;

  // TRUE_FALSE
  correctAnswer?: boolean;

  // MULTIPLE_CHOICE
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];

}
