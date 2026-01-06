import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto } from './dto';
import { QuestionType } from 'generated/prisma/enums';
import { createTrueFalseAlternatives } from './factories/true-false.factory';

@Injectable()
export class QuizzesService {
    constructor(private readonly prisma: PrismaService) { }

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
            question.options.length < 2 &&
            question.options.length > 4
        ) {
            throw new BadRequestException(
                'Questões de múltipla escolha devem ter entre 2 e 4 alternativas',
            );
        }
    }


    async getAllQuizzes() {
        return this.prisma.quiz.findMany({
            include: {
                questions: true,
            },
        });
    }

    async createQuiz(data: CreateQuizDto) {
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

    async getQuizById(id: string) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: {
                questions: true,
            },
        });

        if (!quiz) {
            throw new NotFoundException('Quiz não encontrado');
        }

        return quiz;
    }

    async updateQuiz(id: string, data: UpdateQuizDto) {
        const quizExists = await this.prisma.quiz.findUnique({
            where: { id },
            include: { questions: true },
        });

        if (!quizExists) {
            throw new NotFoundException('Quiz não encontrado');
        }

        // Se o payload contém questions, validar regra
        if (data.questions && data.questions.length === 0) {
            throw new BadRequestException(
                'Não é permitido remover todas as questões do quiz',
            );
        }

        if (data.questions) {
            data.questions.forEach(q => this.validateQuestionRules(q));
        }

        return this.prisma.quiz.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,

                // Estratégia simples:
                // - Remove todas as questões antigas
                // - Cria novamente as enviadas
                ...(data.questions && {
                    questions: {
                        deleteMany: {},
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

                }),
            },
            include: {
                questions: true,
            },
        });
    }

    async deleteQuiz(id: string) {
        // Garante exclusão em cascata manual
        await this.prisma.question.deleteMany({
            where: { quizId: id },
        });

        return this.prisma.quiz.delete({
            where: { id },
        });
    }
}