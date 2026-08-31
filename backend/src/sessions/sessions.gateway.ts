import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Namespace, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionsService } from './sessions.service';
import { SESSION_EVENTS } from './session.events';
import type { AccessTokenPayload } from '../auth/types/auth.types';
import type {
    PlayerJoinedPayload,
    QuizStartedPayload,
    AnswerResultPayload,
    PlayerAnsweredPayload,
    QuestionClosedPayload,
    NextQuestionPayload,
    SessionCanceledPayload,
    SessionFinishedPayload,
    PlayerLeftPayload,
    PlayerKickedPayload,
    PlayerDisconnectPayload,
    SessionCleanupPayload,
} from './session.events';

interface PlayerSocketInfo {
    playerId: string;
    sessionId: string;
    nickname: string;
}

const configService = new ConfigService();
const frontendUrl = configService.get<string>('FRONTEND_URL');

@WebSocketGateway({
    cors: {
        origin: (requestOrigin, callback) => {
            const allowedOrigin = frontendUrl || 'http://localhost:3000';
            const isDev = configService.get<string>('NODE_ENV') !== 'production';
            if (isDev || !requestOrigin || requestOrigin === allowedOrigin) {
                callback(null, true)
            } else {
                callback(new Error('Não permitido pelo CORS'));
            }
        },
        methods: ['GET', 'POST'],
        credentials: true,
    },
    namespace: '/sessions',
})
export class SessionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server | Namespace;

    private readonly logger = new Logger(SessionsGateway.name);

    private socketToPlayer = new Map<string, PlayerSocketInfo>();
    private playerToSocket = new Map<string, string>();
    private hostSockets = new Map<string, string>();

    constructor(
        @Inject(forwardRef(() => SessionsService))
        private readonly sessionsService: SessionsService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    private getSessionsNamespace(): Namespace {
        const s: any = this.server;
        return typeof s.of === 'function' ? (s.of('/sessions') as Namespace) : (s as Namespace);
    }

    private getSocketById(socketId: string): Socket | undefined {
        const nsp: any = this.getSessionsNamespace();
        return nsp.sockets?.get?.(socketId);
    }

    private extractToken(client: Socket): string | null {
        const authHeader = client.handshake.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        const token = client.handshake.auth?.token;
        if (typeof token === 'string') {
            return token.startsWith('Bearer ') ? token.substring(7) : token;
        }
        const cookieHeader = client.handshake.headers?.cookie;
        if (cookieHeader) {
            const cookies = cookieHeader.split(';').map((c) => c.trim());
            const accessCookie = cookies.find((c) => c.startsWith('accessToken='));
            if (accessCookie) {
                return accessCookie.substring('accessToken='.length);
            }
        }
        return null;
    }

    // ─── WebSocket Lifecycle ─────────────────────────────────────────────

    async handleConnection(client: Socket) {
        try {
            const token = this.extractToken(client);
            if (!token) {
                this.logger.warn(`Client connection rejected (missing token): ${client.id}`);
                client.disconnect(true);
                return;
            }

            const accessSecret = this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET');
            const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
                secret: accessSecret,
            });

            if (payload.type !== 'access') {
                this.logger.warn(`Client connection rejected (invalid token type): ${client.id}`);
                client.disconnect(true);
                return;
            }

            client.data = client.data || {};
            client.data.user = {
                userId: payload.sub,
                email: payload.email,
                role: payload.role,
            };

            this.logger.log(`Client connected and authenticated: ${client.id} (user: ${payload.sub})`);
        } catch (error) {
            this.logger.warn(`Client connection rejected (auth error): ${client.id} - ${error.message}`);
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        for (const [sessionId, socketId] of this.hostSockets.entries()) {
            if (socketId === client.id) {
                this.hostSockets.delete(sessionId);
                this.logger.log(`Host disconnected from session ${sessionId}`);
                break;
            }
        }

        const playerInfo = this.socketToPlayer.get(client.id);
        if (!playerInfo) return;

        const { sessionId, playerId, nickname } = playerInfo;
        client.leave(sessionId);

        this.socketToPlayer.delete(client.id);
        this.playerToSocket.delete(playerId);

        this.server.to(sessionId).emit('player_disconnected', {
            sessionId,
            player: { id: playerId, nickname },
            timestamp: new Date().toISOString(),
        });

        this.logger.log(`Player ${nickname} disconnected from session ${sessionId}`);
    }

    // ─── WebSocket Subscribe Handlers ────────────────────────────────────

    @SubscribeMessage('join_session')
    async handleJoinSession(
        @MessageBody() data: { sessionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data?.user;
        if (!user?.userId) {
            return { success: false, error: 'Unauthorized' };
        }

        const { sessionId } = data;
        if (!sessionId) {
            return { success: false, error: 'Session ID is required' };
        }

        try {
            const player = await this.sessionsService.findPlayerBySessionAndUser(sessionId, user.userId);
            const playerId = player.id;
            const nickname = player.nickname;

            const oldSocketId = this.playerToSocket.get(playerId);
            if (oldSocketId && oldSocketId !== client.id) {
                const oldSocket = this.getSocketById(oldSocketId);
                oldSocket?.disconnect(true);
                this.socketToPlayer.delete(oldSocketId);
            }

            client.join(sessionId);
            this.socketToPlayer.set(client.id, { playerId, sessionId, nickname });
            this.playerToSocket.set(playerId, client.id);

            this.logger.log(`Player ${nickname} (${playerId}) joined room ${sessionId}`);

            client.to(sessionId).emit('player_joined', {
                sessionId,
                player: { id: playerId, nickname, joinedAt: new Date().toISOString() },
                timestamp: new Date().toISOString(),
            });

            return { success: true, message: `Joined session ${sessionId}`, player: { id: playerId, nickname } };
        } catch (error) {
            this.logger.error(`Error in join_session for user ${user.userId}: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('join_host')
    async handleJoinHost(@MessageBody() data: { sessionId: string }, @ConnectedSocket() client: Socket) {
        const user = client.data?.user;
        if (!user?.userId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!data?.sessionId) {
            return { success: false, error: 'Session ID is required' };
        }

        try {
            await this.sessionsService.checkHostAccess(data.sessionId, user.userId);
            client.join(data.sessionId);
            this.hostSockets.set(data.sessionId, client.id);
            this.logger.log(`Host ${user.userId} joined room ${data.sessionId}`);
            return { success: true };
        } catch (error) {
            this.logger.error(`Host access denied for user ${user.userId} in session ${data.sessionId}: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('submit_answer')
    async handleSubmitAnswer(
        @MessageBody() data: { sessionId: string; questionId: string; optionId: string; playerId?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data?.user;
        if (!user?.userId) {
            return { success: false, error: 'Unauthorized' };
        }

        const playerInfo = this.socketToPlayer.get(client.id);
        const playerId = playerInfo?.playerId || data.playerId;

        if (!playerId) {
            return { success: false, error: 'Player ID required' };
        }

        const { sessionId, questionId, optionId } = data;

        try {
            await this.sessionsService.submitAnswer(sessionId, questionId, { playerId, optionId }, user.userId);
            return { success: true };
        } catch (error) {
            this.logger.error(`Error submitting answer via WS: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // ─── Internal Event Handlers (@OnEvent) ──────────────────────────────

    @OnEvent(SESSION_EVENTS.PLAYER_JOINED)
    onPlayerJoined(payload: any) {
        const p = payload as PlayerJoinedPayload;
        this.logger.log(`Player joined session ${p.sessionId}: ${p.player.nickname}`);
        this.getSessionsNamespace().to(p.sessionId).emit('player_joined', p);
    }

    @OnEvent(SESSION_EVENTS.QUIZ_STARTED)
    onQuizStarted(payload: any) {
        const p = payload as QuizStartedPayload;
        this.getSessionsNamespace().to(p.sessionId).emit('quiz_started', p);
    }

    @OnEvent(SESSION_EVENTS.ANSWER_RESULT)
    onAnswerResult(payload: any) {
        const { playerId, ...data } = payload as AnswerResultPayload;
        const socketId = this.playerToSocket.get(playerId);
        if (!socketId) return;
        const socket = this.getSocketById(socketId);
        socket?.emit('answer_result', data);
    }

    @OnEvent(SESSION_EVENTS.PLAYER_ANSWERED)
    onPlayerAnswered(payload: any) {
        const p = payload as PlayerAnsweredPayload;
        const hostSocketId = this.hostSockets.get(p.sessionId);
        if (!hostSocketId) return;
        const hostSocket = this.getSocketById(hostSocketId);
        hostSocket?.emit('player_answered', {
            ...p,
            timestamp: new Date().toISOString(),
        });
    }

    @OnEvent(SESSION_EVENTS.QUESTION_CLOSED)
    onQuestionClosed(payload: any) {
        const p = payload as QuestionClosedPayload;
        this.getSessionsNamespace().to(p.sessionId).emit('question_closed', p);
    }

    @OnEvent(SESSION_EVENTS.NEXT_QUESTION)
    onNextQuestion(payload: any) {
        const p = payload as NextQuestionPayload;
        this.getSessionsNamespace().to(p.sessionId).emit('next_question', p);
    }

    @OnEvent(SESSION_EVENTS.SESSION_CANCELED)
    onSessionCanceled(payload: any) {
        const p = payload as SessionCanceledPayload;
        this.logger.log(`Session canceled: ${p.sessionId}`);
        this.getSessionsNamespace().to(p.sessionId).emit('session_canceled', p);
    }

    @OnEvent(SESSION_EVENTS.SESSION_FINISHED)
    onSessionFinished(payload: any) {
        const p = payload as SessionFinishedPayload;
        this.logger.log(`Session finished: ${p.sessionId}`);
        this.getSessionsNamespace().to(p.sessionId).emit('session_finished', p);
    }

    @OnEvent(SESSION_EVENTS.PLAYER_LEFT)
    onPlayerLeft(payload: any) {
        const p = payload as PlayerLeftPayload;
        this.logger.log(`Player left session ${p.sessionId}: ${p.player.nickname}`);
        this.getSessionsNamespace().to(p.sessionId).emit('player_left', p);
    }

    @OnEvent(SESSION_EVENTS.PLAYER_KICKED)
    onPlayerKicked(payload: any) {
        const p = payload as PlayerKickedPayload;
        this.logger.log(`Player kicked from session ${p.sessionId}: ${p.player.nickname}`);
        this.getSessionsNamespace().to(p.sessionId).emit('player_kicked', p);
    }

    @OnEvent(SESSION_EVENTS.PLAYER_DISCONNECT)
    onPlayerDisconnect(payload: any) {
        const { playerId } = payload as PlayerDisconnectPayload;
        if (!playerId) return;

        const socketId = this.playerToSocket.get(playerId);
        if (!socketId) return;

        const nsp = this.getSessionsNamespace();
        const socket = (nsp as any).sockets?.get?.(socketId) as Socket | undefined;

        if (socket) {
            const playerInfo = this.socketToPlayer.get(socketId);
            if (playerInfo) socket.leave(playerInfo.sessionId);
            socket.disconnect(true);
        }

        this.playerToSocket.delete(playerId);
        this.socketToPlayer.delete(socketId);
        this.logger.log(`Player ${playerId} forcefully disconnected`);
    }

    @OnEvent(SESSION_EVENTS.SESSION_CLEANUP)
    onSessionCleanup(payload: any) {
        const { sessionId } = payload as SessionCleanupPayload;
        this.hostSockets.delete(sessionId);
        this.logger.log(`Session ${sessionId} cleaned up from gateway`);
    }

    // ─── Utility ─────────────────────────────────────────────────────────

    getPlayerInfo(playerId: string): PlayerSocketInfo | undefined {
        const socketId = this.playerToSocket.get(playerId);
        return socketId ? this.socketToPlayer.get(socketId) : undefined;
    }

    isPlayerConnected(playerId: string): boolean {
        return this.playerToSocket.has(playerId);
    }
}
