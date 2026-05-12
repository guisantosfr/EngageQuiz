import { Option } from "./Option"
import { QuestionType } from "./QuestionType"

export interface Question {
  id: string
  type: QuestionType
  text: string
  timeLimit: number
  correctAnswer?: boolean
  options?: Option[]
}