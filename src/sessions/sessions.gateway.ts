import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

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
    server: Server;

    private readonly logger = new Logger(SessionsGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    emitPlayerJoined(sessionId: string, playerData: { playerId: string; nickname: string; joinedAt: Date }) {
        this.logger.log(`Player joined session ${sessionId}: ${playerData.nickname}`);

        this.server.emit('player_joined', {
            sessionId,
            player: playerData,
            timestamp: new Date().toISOString(),
        });
    }

    emitToAll(event: string, data: any): void {
        this.server.emit(event, data);
    }

    emitToSession(sessionId: string, event: string, data: any): void {
        this.server.to(sessionId).emit(event, data);
    }

    emitSessionCanceled(sessionId: string) {
        this.logger.log(`Session canceled: ${sessionId}`);

        this.server.emit('session_canceled', {
            sessionId,
            timestamp: new Date().toISOString(),
        });
    }

    emitPlayerLeft(sessionId: string, playerData: { playerId: string; nickname: string }) {
        this.logger.log(`Player left session ${sessionId}: ${playerData.nickname}`);

        this.server.emit('player_left', {
            sessionId,
            player: playerData,
            timestamp: new Date().toISOString(),
        });
    }

    emitPlayerKicked(sessionId: string, playerData: { playerId: string; nickname: string }) {
        this.logger.log(`Player kicked from session ${sessionId}: ${playerData.nickname}`);

        this.server.emit('player_kicked', {
            sessionId,
            player: playerData,
            timestamp: new Date().toISOString(),
        });
    }
}
