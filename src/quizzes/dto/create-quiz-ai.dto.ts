export class CreateQuizAIDto {
    mainSubject: string;
    topicsToInclude?: string;
    restrictions?: string;
    level: string;
    numberOfQuestions: number;
    questionTypes: 'ALL' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
    learningObjectives?: string;
    difficultyLevel?: string;
    educationalContext?: string;
    tone?: string;
    estimatedTime?: string;
    otherComments?: string;
}