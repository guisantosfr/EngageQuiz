import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSessionDto, JoinSessionDto, SubmitAnswerDto } from "./dto";
import { StatusType } from "../generated/prisma/enums";
import { SessionsGateway } from "./sessions.gateway";

@Injectable()
export class SessionsService {
    private readonly logger = new Logger(SessionsService.name);

    private questionTimers = new Map<string, NodeJS.Timeout>();
    private closedQuestions = new Map<string, Set<number>>();

    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => SessionsGateway))
        private readonly gateway: SessionsGateway,
    ) { }

    private generateSessionCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async create(createSessionDto: CreateSessionDto) {
        const { quizId } = createSessionDto;

        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
        });

        if (!quiz) {
            throw new NotFoundException(`Quiz not found`);
        }

        let code: string;
        let codeExists = true;

        while (codeExists) {
            code = this.generateSessionCode();
            const existingSession = await this.prisma.session.findFirst({
                where: {
                    code,
                    status: { in: [StatusType.CREATED, StatusType.IN_PROGRESS] },
                },
            });
            codeExists = !!existingSession;
        }

        const session = await this.prisma.session.create({
            data: {
                quizId,
                code: code!,
                status: StatusType.CREATED,
            },
            include: {
                quiz: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        return session;
    }

    async join(code: string, joinSessionDto: JoinSessionDto) {
        const { nickname } = joinSessionDto;

        return this.prisma.$transaction(async (tx) => {
            const session = await tx.session.findFirst({
                where: {
                    code,
                    status: StatusType.CREATED,
                },
            });

            if (!session) {
                throw new NotFoundException(`Sessão não encontrada / Código inválido`);
            }

            const existingPlayer = await tx.player.findFirst({
                where: {
                    sessionId: session.id,
                    nickname,
                    leftAt: null,
                },
            });

            if (existingPlayer) {
                throw new BadRequestException(`Já existe um jogador com o nickname "${nickname}" na sessão`);
            }

            const player = await tx.player.create({
                data: {
                    sessionId: session.id,
                    nickname,
                },
            });

            return {
                player,
                session: {
                    id: session.id,
                    code: session.code,
                    status: session.status,
                },
            };
        });
    }

    async getSessionPlayers(sessionId: string) {
        return this.prisma.player.findMany({
            where: {
                sessionId,
                leftAt: null,
            },
            orderBy: {
                joinedAt: 'asc',
            },
            select: {
                id: true,
                nickname: true,
            }
        });
    }

    async cancel(sessionId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new NotFoundException(`Session not found`);
        }

        if (session.status === StatusType.CANCELED || session.status === StatusType.FINISHED) {
            throw new BadRequestException(`Session is already ${session.status.toLowerCase()}`);
        }

        this.cancelQuestionTimeout(sessionId);

        const updatedSession = await this.prisma.session.update({
            where: { id: sessionId },
            data: {
                status: StatusType.CANCELED,
                endedAt: new Date(),
            },
        });

        this.gateway.emitSessionCanceled(sessionId);

        return updatedSession;
    }

    async removePlayer(sessionId: string, playerId: string, kicked: boolean = false) {
        return this.prisma.$transaction(async (tx) => {
            const player = await tx.player.findUnique({
                where: { id: playerId },
                include: { session: true },
            });

            if (!player) {
                throw new NotFoundException(`Player not found`);
            }

            if (player.sessionId !== sessionId) {
                throw new BadRequestException(`Player does not belong to this session`);
            }

            if (player.leftAt) {
                throw new BadRequestException(`Player has already left the session`);
            }

            const updatedPlayer = await tx.player.update({
                where: { id: playerId },
                data: { leftAt: new Date() },
            });

            const playerData = { playerId: updatedPlayer.id, nickname: updatedPlayer.nickname };
            if (kicked) {
                this.gateway.emitPlayerKicked(sessionId, playerData);
            } else {
                this.gateway.emitPlayerLeft(sessionId, playerData);
            }

            this.gateway.disconnectPlayer(playerId);

            return updatedPlayer;
        });
    }

    async getSessionPlayerData(sessionId: string, playerId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            select: {
                id: true,
                status: true,
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        _count: {
                            select: { questions: true }
                        }
                    }
                }
            }
        });

        if (!session) {
            throw new NotFoundException(`Session not found`);
        }

        if (session.status !== StatusType.CREATED) {
            throw new BadRequestException(`Session is already started or finished`);
        }

        const { _count, ...quizRest } = session.quiz;

        const player = await this.prisma.player.findUnique({
            where: { id: playerId },
            select: {
                id: true,
                sessionId: true,
                nickname: true
            }
        });

        if (!player) {
            throw new NotFoundException(`Player not found`);
        }

        if (player.sessionId !== sessionId) {
            throw new BadRequestException(`Player does not belong to this session`);
        }

        return {
            session: {
                ...session,
                quiz: {
                    ...quizRest,
                    numberOfQuestions: _count.questions
                }
            },
            player
        };
    }

    async getSessionFullData(sessionId: string, quizId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                quiz: {
                    include: {
                        _count: {
                            select: { questions: true }
                        }
                    }
                },
                players: true
            },
        });

        const quizFound = await this.prisma.quiz.findUnique({
            where: { id: quizId }
        });

        if (!session || !quizFound) {
            throw new NotFoundException(`Session/Quiz not found`);
        }

        if (session.status !== StatusType.CREATED) {
            throw new BadRequestException(`Session is already started or finished`);
        }

        const { quiz, ...rest } = session;
        const { _count, ...quizRest } = quiz;

        return {
            ...rest,
            quiz: {
                ...quizRest,
                numberOfQuestions: _count.questions
            }
        };
    }

    async start(sessionId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                quiz: {
                    include: {
                        questions: {
                            orderBy: { createdAt: 'asc' },
                            include: {
                                options: {
                                    select: { id: true, text: true },
                                },
                            },
                        },
                    },
                },
                players: {
                    where: { leftAt: null },
                },
            },
        });

        if (!session) {
            throw new NotFoundException(`Session not found`);
        }

        if (session.status !== StatusType.CREATED) {
            throw new BadRequestException(`Session is already started or finished`);
        }

        if (session.players.length === 0) {
            throw new BadRequestException(`Session must have at least one active player`);
        }

        if (session.quiz.questions.length === 0) {
            throw new BadRequestException(`Quiz has no questions`);
        }

        const updatedSession = await this.prisma.session.update({
            where: { id: sessionId },
            data: {
                status: StatusType.IN_PROGRESS,
                startedAt: new Date(),
                currentQuestionIndex: 0,
            },
        });

        const firstQuestion = session.quiz.questions[0];

        // Initialize closed questions tracking for this session
        this.closedQuestions.set(sessionId, new Set());

        // Emit quiz_started with first question data
        this.gateway.emitToSession(sessionId, 'quiz_started', {
            sessionId,
            quizId: session.quiz.id,
            totalQuestions: session.quiz.questions.length,
            firstQuestion: {
                index: 0,
                id: firstQuestion.id,
                text: firstQuestion.text,
                type: firstQuestion.type,
                timeLimit: firstQuestion.timeLimit,
                options: firstQuestion.options,
            },
            timestamp: new Date().toISOString(),
        });

        // Schedule timer for first question
        this.scheduleQuestionTimeout(sessionId, firstQuestion.id, 0, firstQuestion.timeLimit);

        return updatedSession;
    }

    async submitAnswer(sessionId: string, questionId: string, submitAnswerDto: SubmitAnswerDto) {
        const { playerId, optionId } = submitAnswerDto;

        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                quiz: {
                    include: {
                        questions: {
                            orderBy: { createdAt: 'asc' },
                        },
                    },
                },
            },
        });

        if (!session) {
            throw new NotFoundException(`Session not found`);
        }

        if (session.status !== StatusType.IN_PROGRESS) {
            throw new BadRequestException(`Session is not in progress`);
        }

        // Verify the question matches the current question
        const currentIndex = session.currentQuestionIndex ?? 0;
        const currentQuestion = session.quiz.questions[currentIndex];

        if (!currentQuestion || currentQuestion.id !== questionId) {
            throw new BadRequestException(`This is not the current active question`);
        }

        // Check if question is already closed
        const closedSet = this.closedQuestions.get(sessionId);
        if (closedSet?.has(currentIndex)) {
            throw new BadRequestException(`Time is up for this question`);
        }

        // Verify player
        const player = await this.prisma.player.findUnique({
            where: { id: playerId },
        });

        if (!player) {
            throw new NotFoundException(`Player not found`);
        }

        if (player.sessionId !== sessionId || player.leftAt !== null) {
            throw new BadRequestException(`Player does not belong to this session or has left`);
        }

        // Check for duplicate answer
        const existingResponse = await this.prisma.response.findFirst({
            where: {
                playerId,
                questionId,
            },
        });

        if (existingResponse) {
            throw new BadRequestException(`Player has already answered this question`);
        }

        // Verify option belongs to the question
        const option = await this.prisma.option.findUnique({
            where: { id: optionId },
        });

        if (!option || option.questionId !== questionId) {
            throw new BadRequestException(`Option does not belong to this question`);
        }

        // Create response
        const response = await this.prisma.response.create({
            data: {
                playerId,
                questionId,
                optionId,
                isCorrect: option.isCorrect,
            },
        });

        // Emit answer_result only to the player who answered
        this.gateway.emitToPlayer(playerId, 'answer_result', {
            sessionId,
            questionId,
            received: true,
            timestamp: new Date().toISOString(),
        });

        // Count answers and active players
        const [totalAnswers, totalPlayers] = await Promise.all([
            this.prisma.response.count({
                where: { questionId, player: { sessionId, leftAt: null } },
            }),
            this.prisma.player.count({
                where: { sessionId, leftAt: null },
            }),
        ]);

        // Emit player_answered to host
        this.gateway.emitPlayerAnswered(sessionId, {
            questionId,
            playerId,
            playerNickname: player.nickname,
            answeredAt: response.answeredAt.toISOString(),
            totalAnswers,
            totalPlayers,
        });

        // Auto-close if all players have answered
        if (totalAnswers >= totalPlayers) {
            await this.closeQuestion(sessionId, questionId, currentIndex, 'all_answered');
        }

        return response;
    }

    async closeQuestion(sessionId: string, questionId: string, questionIndex: number, reason: 'timeout' | 'all_answered') {
        // Mark question as closed (prevents more answers and double-closing)
        const closedSet = this.closedQuestions.get(sessionId);
        if (closedSet?.has(questionIndex)) {
            return; // Already closed
        }
        closedSet?.add(questionIndex);

        // Cancel any pending timer
        this.cancelQuestionTimeout(sessionId);

        // Get stats for the question
        const question = await this.prisma.question.findUnique({
            where: { id: questionId },
            include: {
                options: true,
                responses: {
                    where: {
                        player: {
                            sessionId,
                            leftAt: null,
                        },
                    },
                },
            },
        });

        if (!question) return;

        const totalAnswers = question.responses.length;
        const correctAnswers = question.responses.filter((r) => r.isCorrect).length;

        const optionBreakdown = question.options.map((opt) => {
            const count = question.responses.filter((r) => r.optionId === opt.id).length;
            return {
                optionId: opt.id,
                text: opt.text,
                count,
                percentage: totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0,
                isCorrect: opt.isCorrect,
            };
        });

        const correctOption = question.options.find((opt) => opt.isCorrect);

        this.gateway.emitToSession(sessionId, 'question_closed', {
            sessionId,
            questionId,
            questionIndex,
            reason,
            correctOptionId: correctOption?.id ?? null,
            stats: {
                totalAnswers,
                correctAnswers,
                optionBreakdown,
            },
            timestamp: new Date().toISOString(),
        });

        this.logger.log(`Question ${questionIndex} closed for session ${sessionId}`);
    }

    async nextQuestion(sessionId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                quiz: {
                    include: {
                        questions: {
                            orderBy: { createdAt: 'asc' },
                            include: {
                                options: {
                                    select: { id: true, text: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!session) {
            throw new NotFoundException(`Session not found`);
        }

        if (session.status !== StatusType.IN_PROGRESS) {
            throw new BadRequestException(`Session is not in progress`);
        }

        const currentIndex = session.currentQuestionIndex ?? 0;

        // Verify current question has been closed
        const closedSet = this.closedQuestions.get(sessionId);
        if (!closedSet?.has(currentIndex)) {
            throw new BadRequestException(`Current question has not been closed yet`);
        }

        const nextIndex = currentIndex + 1;

        if (nextIndex >= session.quiz.questions.length) {
            throw new BadRequestException(`No more questions available`);
        }

        // Update currentQuestionIndex
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { currentQuestionIndex: nextIndex },
        });

        const nextQuestionData = session.quiz.questions[nextIndex];

        // Emit next_question
        this.gateway.emitToSession(sessionId, 'next_question', {
            sessionId,
            question: {
                index: nextIndex,
                id: nextQuestionData.id,
                text: nextQuestionData.text,
                type: nextQuestionData.type,
                timeLimit: nextQuestionData.timeLimit,
                options: nextQuestionData.options,
            },
            timestamp: new Date().toISOString(),
        });

        // Schedule timer for this question
        this.scheduleQuestionTimeout(sessionId, nextQuestionData.id, nextIndex, nextQuestionData.timeLimit);

        return { questionIndex: nextIndex, questionId: nextQuestionData.id };
    }

    private scheduleQuestionTimeout(sessionId: string, questionId: string, questionIndex: number, timeLimitSeconds: number) {
        // Cancel any existing timer
        this.cancelQuestionTimeout(sessionId);

        const timer = setTimeout(async () => {
            this.logger.log(`Timer expired for question ${questionIndex} in session ${sessionId}`);
            try {
                await this.closeQuestion(sessionId, questionId, questionIndex, 'timeout');
            } catch (error) {
                this.logger.error(`Error closing question on timeout: ${error.message}`);
            }
        }, timeLimitSeconds * 1000);

        this.questionTimers.set(sessionId, timer);

        this.logger.log(`Timer scheduled for question ${questionIndex} in session ${sessionId}: ${timeLimitSeconds}s`);
    }

    private cancelQuestionTimeout(sessionId: string) {
        const timer = this.questionTimers.get(sessionId);
        if (timer) {
            clearTimeout(timer);
            this.questionTimers.delete(sessionId);
            this.logger.log(`Timer canceled for session ${sessionId}`);
        }
    }
}