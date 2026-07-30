import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOptionDto, CreateQuizDto, UpdateQuizDto } from './dto';
import { QuestionType } from '../generated/prisma/enums';
import { createTrueFalseAlternatives } from './factories/true-false.factory';
import { GetQuizDto } from './dto/get-quiz.dto';
import { QuizMapper } from './mappers/quiz.mapper';
import { CreateQuizAIDto } from './dto/create-quiz-ai.dto';
import { GoogleGenAI, Type } from '@google/genai'

@Injectable()
export class QuizzesService {
    private readonly logger = new Logger(QuizzesService.name);
    private readonly gemini: GoogleGenAI;

    constructor(private readonly prisma: PrismaService) {
        this.gemini = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });
    }

    private validateQuestionRules(question: {
        type: QuestionType;
        options?: { isCorrect: boolean; text: string }[];
    }) {
        if (question.type === 'TRUE_FALSE') {
            return;
        }

        const correctCount = question.options.filter(a => a.isCorrect).length;

        if (correctCount !== 1) {
            throw new BadRequestException(
                'Cada questão deve possuir exatamente uma alternativa correta',
            );
        }

        if (
            question.type === 'MULTIPLE_CHOICE' &&
            (question.options.length < 2 || question.options.length > 4)
        ) {
            throw new BadRequestException(
                'Questões de múltipla escolha devem ter entre 2 e 4 alternativas',
            );
        }
    }

    private buildAIPrompt(data: CreateQuizAIDto): string {
        const {
            mainSubject,
            topicsToInclude,
            restrictions,
            level,
            numberOfQuestions,
            questionTypes,
            learningObjectives,
            difficultyLevel,
            educationalContext,
            tone,
            estimatedTime,
            otherComments
        } = data;

        let prompt = 'Atue como um professor e gere um questionário educional para seus alunos, com base nos seguintes parâmetros especificados.\n\n';

        if (mainSubject) {
            prompt += `**Tema / Assunto principal:** ${mainSubject}\n\n`;
        }

        if (topicsToInclude && topicsToInclude.trim()) {
            prompt += `**Subtópicos / Tópicos a incluir:** ${topicsToInclude}\n\n`;
        }

        if (restrictions && restrictions.trim()) {
            prompt += `**Restrições / Coisas para não incluir:** ${restrictions}\n\n`;
        }

        if (level && level.trim()) {
            prompt += `**Nível / Público Alvo:** ${level}\n\n`;
        }

        if (numberOfQuestions) {
            prompt += `**Quantidade de questões:** ${numberOfQuestions}\n\n`;
        }

        if (questionTypes === 'ALL') {
            prompt += '- Varie entre diferentes tipos de questões (verdadeiro ou falso e múltipla escolha)\n';
            prompt += 'As questões de múltipla escolha tevem conter 4 alternativas e apenas uma correta.\n\n'
        } else if (questionTypes === 'MULTIPLE_CHOICE') {
            prompt += '- Todas as questões devem ser de múltipla escolha com 4 alternativas e uma única correta.\n';
        } else if (questionTypes === 'TRUE_FALSE') {
            prompt += '- Todas as questões devem ser de verdadeiro ou falso\n';
        }

        if (learningObjectives && learningObjectives.trim()) {
            prompt += `**Objetivo de aprendizagem:** ${learningObjectives}\n\n`;
        }

        if (difficultyLevel && difficultyLevel.trim()) {
            prompt += `**Nível de dificuldade:** ${difficultyLevel}\n\n`;
        }

        if (educationalContext && educationalContext.trim()) {
            prompt += `**Contexto educacional:** ${educationalContext}\n\n`;
        }

        if (tone && tone.trim()) {
            prompt += `**Linguagem / Tom das questões:** ${tone}\n\n`;
        }

        if (estimatedTime && estimatedTime.trim()) {
            prompt += `**Tempo estimado por resposta:** ${estimatedTime}\n\n`;
        }

        if (otherComments && otherComments.trim()) {
            prompt += `**Outros comentários / instruções:** ${otherComments}\n\n`;
        }


        prompt += '**Instruções:**\n';
        prompt += '- Certifique-se de que as questões estejam alinhadas com os parâmetros especificados\n';
        prompt += '- Cada questão deve conter um tempo adequado para sua resolução, podendo ser de 15, 30, 45 ou 60 segundos.\n';
        prompt += '- O título ("title") do questionário não deve conter mais do que 100 caracteres.\n';
        prompt += '- A descrição ("description") do questionário não deve conter mais do que 200 caracteres.\n';

        return prompt;
    }


    async getAllQuizzes(userId: string) {
        const quizzes = await this.prisma.quiz.findMany({
            where: { userId },
            include: {
                _count: {
                    select: {
                        questions: true,
                    },
                },
            },
        });

        return quizzes.map(quiz => {
            const { _count, ...rest } = quiz;
            return {
                ...rest,
                questions: _count.questions,
            };
        });
    }

    async createQuiz(data: CreateQuizDto, userId: string) {
        if (!data.questions || data.questions.length === 0) {
            throw new BadRequestException(
                'Não é permitido criar um quiz sem questões',
            );
        }

        data.questions.forEach(q => this.validateQuestionRules(q));

        return this.prisma.quiz.create({
            data: {
                title: data.title,
                description: data.description,
                userId,
                questions: {
                    create: data.questions.map(q => {
                        const options =
                            q.type === 'TRUE_FALSE'
                                ? createTrueFalseAlternatives(q.correctAnswer)
                                : q.options;

                        this.validateQuestionRules({
                            type: q.type,
                            options,
                        });

                        return {
                            text: q.text,
                            type: q.type,
                            timeLimit: q.timeLimit,
                            options: {
                                create: options.map(a => ({
                                    text: a.text,
                                    isCorrect: a.isCorrect,
                                })),
                            },
                        };
                    }),
                },
            },
            include: {
                questions: true,
            },
        });
    }

    async getQuizById(id: string, userId: string): Promise<GetQuizDto> {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id, userId },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });

        if (!quiz) {
            throw new NotFoundException('Quiz não encontrado');
        }

        return QuizMapper.toEditDto(quiz);
    }

    private prepareOptionsForUpsert(question: any, existingQuestion?: any): CreateOptionDto[] {
        let options: CreateOptionDto[];

        if (question.type === 'TRUE_FALSE') {
            // Gera as alternativas base
            const generatedOptions = createTrueFalseAlternatives(question.correctAnswer);

            // Se a questão já existe, preserva os IDs
            if (existingQuestion?.options) {
                options = generatedOptions.map(genOpt => {
                    const existingOption = existingQuestion.options.find(
                        exOpt => exOpt.text === genOpt.text
                    );

                    return {
                        ...genOpt,
                        ...(existingOption && { id: existingOption.id }),
                    };
                });
            } else {
                options = generatedOptions;
            }
        } else {
            options = question.options;
        }

        return options;
    }

    async updateQuiz(id: string, data: UpdateQuizDto, userId: string) {
        const quizExists = await this.prisma.quiz.findUnique({
            where: { id, userId },
            include: { questions: { include: { options: true } } },
        });

        if (!quizExists) {
            throw new NotFoundException('Quiz não encontrado');
        }

        if (data.questions && data.questions.length === 0) {
            throw new BadRequestException(
                'Não é permitido remover todas as questões do quiz',
            );
        }

        if (data.questions) {
            data.questions.forEach(q => this.validateQuestionRules(q));
        }

        const sentQuestionIds = data.questions
            ?.filter(q => q.id)
            .map(q => q.id) || [];

        const questionsToDelete = quizExists.questions
            .filter(q => !sentQuestionIds.includes(q.id))
            .map(q => q.id);

        return this.prisma.quiz.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                ...(data.questions && {
                    questions: {
                        // Remove questões que não vieram no payload
                        delete: questionsToDelete.map(qId => ({ id: qId })),

                        // Atualiza ou cria cada questão
                        upsert: data.questions.map(q => {
                            const existingQuestion = quizExists.questions.find(
                                eq => eq.id === q.id
                            );

                            // Prepara as opções com IDs preservados se existirem
                            const options = this.prepareOptionsForUpsert(q, existingQuestion);

                            this.validateQuestionRules({ type: q.type, options });

                            // IDs das opções enviadas para esta questão
                            const sentOptionIds = options
                                ?.filter(opt => opt.id)
                                .map(opt => opt.id) || [];

                            // IDs das opções a remover (existentes mas não enviadas)
                            const optionsToDelete = existingQuestion?.options
                                .filter(opt => !sentOptionIds.includes(opt.id))
                                .map(opt => opt.id) || [];


                            return {
                                where: { id: q.id || 'new' },
                                create: {
                                    text: q.text,
                                    type: q.type,
                                    timeLimit: q.timeLimit,
                                    options: {
                                        create: options.map(a => ({
                                            text: a.text,
                                            isCorrect: a.isCorrect,
                                        })),
                                    },
                                },
                                update: {
                                    text: q.text,
                                    type: q.type,
                                    timeLimit: q.timeLimit,
                                    options: {
                                        delete: optionsToDelete.map(optId => ({ id: optId })),

                                        upsert: options.map(opt => ({
                                            where: { id: opt.id || 'new' },
                                            create: {
                                                text: opt.text,
                                                isCorrect: opt.isCorrect,
                                            },
                                            update: {
                                                text: opt.text,
                                                isCorrect: opt.isCorrect,
                                            },
                                        })),
                                    },
                                },
                            };
                        }),
                    },
                }),
            },
            include: {
                questions: { include: { options: true } },
            },
        });
    }

    async deleteQuiz(id: string, userId: string) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) throw new NotFoundException('Quiz não encontrado');
        if (quiz.userId !== userId) throw new ForbiddenException('Você não tem permissão para deletar este quiz');

        return this.prisma.quiz.delete({ where: { id } });
    }

    async generateQuizByAI(data: CreateQuizAIDto, userId: string) {
        const prompt = this.buildAIPrompt(data);

        const model = 'gemini-2.5-flash'

        const formattingInstruction = `
        IMPORTANTE SOBRE O FORMATO JSON:
        - Para questões 'MULTIPLE_CHOICE': Preencha o array "options" e deixe "correctAnswer" como null.
        - Para questões 'TRUE_FALSE': Preencha "correctAnswer" (boolean) e deixe "options" como null.
        `;

        const finalPrompt = prompt + formattingInstruction;

        try {
            const response = await this.gemini.models.generateContent({
                model,
                contents: finalPrompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING, },
                            description: { type: Type.STRING },
                            questions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        text: { type: Type.STRING },
                                        type: {
                                            type: Type.STRING,
                                            enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE']
                                        },
                                        timeLimit: {
                                            type: Type.NUMBER
                                        },
                                        options: {
                                            type: Type.ARRAY,
                                            nullable: true,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    id: { type: Type.STRING },
                                                    text: { type: Type.STRING },
                                                    isCorrect: { type: Type.BOOLEAN }
                                                },
                                                required: ['text', 'isCorrect']
                                            }
                                        },
                                        correctAnswer: {
                                            type: Type.BOOLEAN,
                                            nullable: true
                                        }
                                    },
                                    required: ['text', 'type', 'timeLimit']
                                }
                            }
                        },
                        required: ['title', 'description', 'questions']
                    }
                }
            });

            if (!response || !response.text) {
                throw new BadRequestException('Falha ao gerar quiz via IA');
            }

            return JSON.parse(response.text);
        } catch (error) {
            this.logger.error(`Error generating quiz by AI: ${error.message}`, error.stack);

            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Ocorreu um erro ao gerar o questionário com IA. Por favor, tente novamente mais tarde.'
            );
        }
    }
}