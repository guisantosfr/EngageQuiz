import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateQuizAIDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50, { message: 'O assunto principal deve ter no máximo 50 caracteres' })
    mainSubject: string;

    @IsOptional()
    @IsString()
    @MaxLength(200, { message: 'Os tópicos a serem incluídos devem ter no máximo 200 caracteres' })
    topicsToInclude?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200, { message: 'As restrições devem ter no máximo 200 caracteres' })
    restrictions?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    level: string;

    @IsInt()
    @Min(1)
    @Max(20, { message: 'O número de questões deve ser no máximo 20' })
    numberOfQuestions: number;

    @IsEnum(['ALL', 'MULTIPLE_CHOICE', 'TRUE_FALSE'])
    questionTypes: 'ALL' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

    @IsOptional()
    @IsString()
    @MaxLength(200, { message: 'Os objetivos de aprendizagem devem ter no máximo 200 caracteres' })
    learningObjectives?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    difficultyLevel?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    educationalContext?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    tone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    estimatedTime?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    otherComments?: string;
}