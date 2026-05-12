import { GetQuizDto } from "../dto/get-quiz.dto";

export class QuizMapper {
  static toEditDto(quiz: any): GetQuizDto {
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
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
