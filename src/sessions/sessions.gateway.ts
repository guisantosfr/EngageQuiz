import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
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

    // Chamado quando um cliente se conecta
    handleConnection(client: Socket) {
        this.logger.log(`Cliente conectado: ${client.id}`);
    }

    // Chamado quando um cliente se desconecta
    handleDisconnect(client: Socket) {
        this.logger.log(`Cliente desconectado: ${client.id}`);
    }

    // Evento de teste simples - responde com uma mensagem de confirmação
    @SubscribeMessage('ping')
    handlePing(
        @MessageBody() data: any,
        @ConnectedSocket() client: Socket,
    ): { event: string; data: any } {
        this.logger.log(`Ping recebido de ${client.id}: ${JSON.stringify(data)}`);

        return {
            event: 'pong',
            data: {
                message: 'Pong! Conexão WebSocket funcionando.',
                receivedData: data,
                timestamp: new Date().toISOString(),
            },
        };
    }

    // Evento de teste que envia broadcast para todos os clientes conectados
    @SubscribeMessage('broadcast')
    handleBroadcast(
        @MessageBody() data: { message: string },
        @ConnectedSocket() client: Socket,
    ): void {
        this.logger.log(`Broadcast de ${client.id}: ${data.message}`);

        console.log(data)
        console.log(data.message)

        // Envia para todos os clientes, incluindo o remetente
        this.server.emit('broadcast-message', {
            from: client.id,
            message: data.message,
            timestamp: new Date().toISOString(),
        });
    }

    // Método utilitário para emitir eventos do servidor (pode ser chamado de outros serviços)
    emitToAll(event: string, data: any): void {
        this.server.emit(event, data);
    }

    // Método para emitir para um cliente específico
    emitToClient(clientId: string, event: string, data: any): void {
        this.server.to(clientId).emit(event, data);
    }
}
