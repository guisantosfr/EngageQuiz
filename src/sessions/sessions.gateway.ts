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
}
