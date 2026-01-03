import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto } from './dto';

@Injectable()
export class QuizzesService {
    constructor(private readonly prisma: PrismaService) { }

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

        return this.prisma.quiz.create({
            data: {
                title: data.title,
                description: data.description,
                questions: {
                    create: data.questions.map((q) => ({
                        text: q.text,
                        type: q.type,
                    })),
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
                        create: data.questions.map((q) => ({
                            text: q.text,
                            type: q.type,
                        })),
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