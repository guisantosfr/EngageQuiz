import { Prisma } from "../../generated/prisma/client";
import { GetQuizDto } from "../dto/get-quiz.dto";

export type QuizWithQuestionsAndOptions = Prisma.QuizGetPayload<{
  include: {
    questions: {
      include: {
        options: true;
      };
    };
  };
}>;

export class QuizMapper {
  static toEditDto(quiz: QuizWithQuestionsAndOptions): GetQuizDto {
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description ?? undefined,
      questions: quiz.questions.map(q => {
        if (q.type === 'TRUE_FALSE') {
          return {
            id: q.id,
            text: q.text,
            type: q.type,
            timeLimit: q.timeLimit,
            correctAnswer: q.options.find(o => o.isCorrect)?.text === 'Verdadeiro',
          };
        }

        return {
          id: q.id,
          text: q.text,
          type: q.type,
          timeLimit: q.timeLimit,
          options: q.options.map(o => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect,
          }))
        };
      }),
    };
  }
}

