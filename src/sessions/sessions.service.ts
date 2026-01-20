import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSessionDto, JoinSessionDto } from "./dto";
import { StatusType } from "../generated/prisma/enums";
import { SessionsGateway } from "./sessions.gateway";

@Injectable()
export class SessionsService {
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

        console.log(createSessionDto)

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

    /**
     * Join a session using Prisma transaction for atomicity
     */
    async join(code: string, joinSessionDto: JoinSessionDto) {
        const { nickname } = joinSessionDto;

        return this.prisma.$transaction(async (tx) => {
            // Find session by code
            const session = await tx.session.findFirst({
                where: {
                    code,
                    status: StatusType.CREATED,
                },
            });

            if (!session) {
                throw new NotFoundException(`Session not found or not joinable`);
            }

            // Check if nickname is already taken (within transaction)
            const existingPlayer = await tx.player.findFirst({
                where: {
                    sessionId: session.id,
                    nickname,
                    leftAt: null,
                },
            });

            if (existingPlayer) {
                throw new BadRequestException(`Nickname "${nickname}" is already taken in this session`);
            }

            // Create player atomically
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
        });
    }

    /**
     * Cancel a session and notify all connected clients
     */
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

        const updatedSession = await this.prisma.session.update({
            where: { id: sessionId },
            data: {
                status: StatusType.CANCELED,
                endedAt: new Date(),
            },
        });

        // Emit session canceled event to all clients in the session room
        this.gateway.emitSessionCanceled(sessionId);

        return updatedSession;
    }

    /**
     * Remove a player from a session (leave or kick)
     * @param sessionId - The session ID
     * @param playerId - The player ID to remove
     * @param kicked - If true, player was kicked; if false, player left voluntarily
     */
    async removePlayer(sessionId: string, playerId: string, kicked: boolean = false) {
        const player = await this.prisma.player.findUnique({
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

        const updatedPlayer = await this.prisma.player.update({
            where: { id: playerId },
            data: { leftAt: new Date() },
        });

        // Emit appropriate event based on kicked flag
        const playerData = { playerId: updatedPlayer.id, nickname: updatedPlayer.nickname };
        if (kicked) {
            this.gateway.emitPlayerKicked(sessionId, playerData);
        } else {
            this.gateway.emitPlayerLeft(sessionId, playerData);
        }

        // Disconnect player from WebSocket
        this.gateway.disconnectPlayer(playerId);

        return updatedPlayer;
    }
}