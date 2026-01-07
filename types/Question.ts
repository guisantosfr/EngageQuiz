import { QuestionType } from "./QuestionType"

export interface Question {
  id: string
  type: QuestionType
  text: string
  options: string[]
  correctAnswer: number
  timeLimit: number
  questions?: Question[]
}