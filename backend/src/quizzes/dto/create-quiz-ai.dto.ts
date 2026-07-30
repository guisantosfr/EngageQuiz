import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateQuizAIDto {
    @IsString()
    @IsNotEmpty()
    mainSubject: string;

    @IsOptional()
    @IsString()
    topicsToInclude?: string;

    @IsOptional()
    @IsString()
    restrictions?: string;

    @IsString()
    @IsNotEmpty()
    level: string;

    @IsInt()
    @Min(1)
    numberOfQuestions: number;

    @IsEnum(['ALL', 'MULTIPLE_CHOICE', 'TRUE_FALSE'])
    questionTypes: 'ALL' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

    @IsOptional()
    @IsString()
    learningObjectives?: string;

    @IsOptional()
    @IsString()
    difficultyLevel?: string;

    @IsOptional()
    @IsString()
    educationalContext?: string;

    @IsOptional()
    @IsString()
    tone?: string;

    @IsOptional()
    @IsString()
    estimatedTime?: string;

    @IsOptional()
    @IsString()
    otherComments?: string;
}