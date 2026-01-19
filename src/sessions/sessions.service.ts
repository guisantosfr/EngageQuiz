import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSessionDto, JoinSessionDto } from "./dto";
import { StatusType } from "../generated/prisma/enums";

@Injectable()
export class SessionsService {
    constructor(private readonly prisma: PrismaService) { }

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
                    status: { in: ['CREATED', 'IN_PROGRESS', 'QUESTION_OPEN', 'QUESTION_CLOSED'] },
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

    async join(joinSessionDto: JoinSessionDto) {
        const { nickname, code } = joinSessionDto;

        const session = await this.prisma.session.findFirst({
            where: {
                code,
                status: StatusType.CREATED,
            },
        });

        if (!session) {
            throw new NotFoundException(`Session not found or not joinable`);
        }

        const existingPlayer = await this.prisma.player.findFirst({
            where: {
                sessionId: session.id,
                nickname,
                leftAt: null,
            },
        });

        if (existingPlayer) {
            throw new BadRequestException(`Nickname "${nickname}" is already taken in this session`);
        }

        const player = await this.prisma.player.create({
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

        return this.prisma.session.update({
            where: { id: sessionId },
            data: {
                status: StatusType.CANCELED,
                endedAt: new Date(),
            },
        });
    }

    async leaveSession(playerId: string) {
        const player = await this.prisma.player.findUnique({
            where: { id: playerId },
            include: { session: true },
        });

        if (!player) {
            throw new NotFoundException(`Player not found`);
        }

        if (player.leftAt) {
            throw new BadRequestException(`Player has already left the session`);
        }

        const updatedPlayer = await this.prisma.player.update({
            where: { id: playerId },
            data: { leftAt: new Date() },
        });

        return {
            player: updatedPlayer,
            sessionId: player.sessionId,
        };
    }

    async kickPlayer(playerId: string) {
        const player = await this.prisma.player.findUnique({
            where: { id: playerId },
            include: { session: true },
        });

        if (!player) {
            throw new NotFoundException(`Player not found`);
        }

        if (player.leftAt) {
            throw new BadRequestException(`Player has already left the session`);
        }

        const updatedPlayer = await this.prisma.player.update({
            where: { id: playerId },
            data: { leftAt: new Date() },
        });

        return {
            player: updatedPlayer,
            sessionId: player.sessionId,
        };
    }
}