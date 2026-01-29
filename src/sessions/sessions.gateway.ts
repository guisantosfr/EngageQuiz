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
import { Logger } from '@nestjs/common';

interface PlayerSocketInfo {
    playerId: string;
    sessionId: string;
    nickname: string;
}

@WebSocketGateway({
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    namespace: '/sessions',
})
export class SessionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server | Namespace;

    private readonly logger = new Logger(SessionsGateway.name);

    // Maps for socket ↔ player association
    private socketToPlayer = new Map<string, PlayerSocketInfo>();
    private playerToSocket = new Map<string, string>();

    private getSessionsNamespace(): Namespace {
        const s: any = this.server;
        // Se for Server, usamos .of('/sessions'); se já for Namespace, retornamos direto
        return typeof s.of === 'function' ? (s.of('/sessions') as Namespace) : (s as Namespace);
    }

    private getSocketById(socketId: string): Socket | undefined {
        const nsp: any = this.getSessionsNamespace();
        return nsp.sockets?.get?.(socketId);
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        const playerInfo = this.socketToPlayer.get(client.id);
        if (!playerInfo) return;

        const { sessionId, playerId, nickname } = playerInfo;
        client.leave(sessionId);

        this.socketToPlayer.delete(client.id);
        this.playerToSocket.delete(playerId);

        this.emitToSession(sessionId, 'player_disconnected', {
            sessionId,
            player: {
                playerId: playerId,
                nickname: nickname,
            },
            timestamp: new Date().toISOString(),
        });

        this.logger.log(`Player ${playerInfo.nickname} disconnected from session ${playerInfo.sessionId}`);
    }

    @SubscribeMessage('join_session')
    handleJoinSession(
        @MessageBody() data: { playerId: string; sessionId: string; nickname: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { playerId, sessionId, nickname } = data;

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
            player: { playerId, nickname, joinedAt: new Date().toISOString() },
            timestamp: new Date().toISOString(),
        });

        return { success: true, message: `Joined session ${sessionId}` };
    }

    @SubscribeMessage('join_host')
    handleJoinHost(@MessageBody() data: { sessionId: string }, @ConnectedSocket() client: Socket) {
        client.join(data.sessionId);
        return { success: true };
    }

    emitToSession(sessionId: string, event: string, data: any): void {
        this.server.to(sessionId).emit(event, data);
    }

    emitToAll(event: string, data: any): void {
        this.server.emit(event, data);
    }

    disconnectPlayer(playerId: string): void {
        const socketId = this.playerToSocket.get(playerId);
        if (!socketId) return;

        const nsp = this.getSessionsNamespace();

        // No namespace, sockets é um Map no Socket.IO v4
        const socket = (nsp as any).sockets?.get?.(socketId) as Socket | undefined;

        if (socket) {
            const playerInfo = this.socketToPlayer.get(socketId);

            if (playerInfo) {
                socket.leave(playerInfo.sessionId);
            }

            socket.disconnect(true);
        }

        this.playerToSocket.delete(playerId);
        this.socketToPlayer.delete(socketId);

        this.logger.log(`Player ${playerId} forcefully disconnected`);
    }

    emitSessionCanceled(sessionId: string): void {
        this.logger.log(`Session canceled: ${sessionId}`);
        this.emitToSession(sessionId, 'session_canceled', {
            sessionId,
            timestamp: new Date().toISOString(),
        });
    }

    emitPlayerLeft(sessionId: string, playerData: { playerId: string; nickname: string }): void {
        this.logger.log(`Player left session ${sessionId}: ${playerData.nickname}`);
        this.emitToSession(sessionId, 'player_left', {
            sessionId,
            player: playerData,
            timestamp: new Date().toISOString(),
        });
    }

    emitPlayerKicked(sessionId: string, playerData: { playerId: string; nickname: string }): void {
        this.logger.log(`Player kicked from session ${sessionId}: ${playerData.nickname}`);
        this.emitToSession(sessionId, 'player_kicked', {
            sessionId,
            player: playerData,
            timestamp: new Date().toISOString(),
        });
    }

    getPlayerInfo(playerId: string): PlayerSocketInfo | undefined {
        const socketId = this.playerToSocket.get(playerId);
        if (socketId) {
            return this.socketToPlayer.get(socketId);
        }
        return undefined;
    }

    isPlayerConnected(playerId: string): boolean {
        return this.playerToSocket.has(playerId);
    }
}
