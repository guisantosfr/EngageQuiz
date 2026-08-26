import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionsGateway } from './sessions.gateway';
import { SessionsService } from './sessions.service';

describe('SessionsGateway', () => {
    let gateway: SessionsGateway;
    let service: SessionsService;
    let jwtService: JwtService;

    const mockSessionsService = {
        submitAnswer: jest.fn(),
        checkHostAccess: jest.fn(),
        findPlayerBySessionAndUser: jest.fn(),
    };

    const mockJwtService = {
        verifyAsync: jest.fn(),
    };

    const mockConfigService = {
        getOrThrow: jest.fn().mockReturnValue('mock-secret'),
    };

    const mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
        of: jest.fn().mockReturnThis(),
        sockets: {
            get: jest.fn(),
        },
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionsGateway,
                { provide: SessionsService, useValue: mockSessionsService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        gateway = module.get<SessionsGateway>(SessionsGateway);
        service = module.get<SessionsService>(SessionsService);
        jwtService = module.get<JwtService>(JwtService);

        gateway.server = mockServer as any;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('handleConnection', () => {
        it('should disconnect client if no token is provided', async () => {
            const client: any = {
                id: 'socket-1',
                handshake: { headers: {}, auth: {} },
                disconnect: jest.fn(),
            };

            await gateway.handleConnection(client);
            expect(client.disconnect).toHaveBeenCalledWith(true);
        });

        it('should disconnect client if token validation fails', async () => {
            const client: any = {
                id: 'socket-1',
                handshake: { auth: { token: 'invalid-token' } },
                disconnect: jest.fn(),
            };
            mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

            await gateway.handleConnection(client);
            expect(client.disconnect).toHaveBeenCalledWith(true);
        });

        it('should authenticate client with valid token and attach user to client.data', async () => {
            const client: any = {
                id: 'socket-1',
                handshake: { auth: { token: 'valid-token' } },
                disconnect: jest.fn(),
                data: {},
            };
            mockJwtService.verifyAsync.mockResolvedValue({
                sub: 'user-123',
                email: 'test@example.com',
                type: 'access',
            });

            await gateway.handleConnection(client);
            expect(client.disconnect).not.toHaveBeenCalled();
            expect(client.data.user).toEqual({
                userId: 'user-123',
                email: 'test@example.com',
                role: undefined,
            });
        });

        it('should authenticate client with token extracted from cookie header', async () => {
            const client: any = {
                id: 'socket-1',
                handshake: { headers: { cookie: 'otherCookie=123; accessToken=cookie-token' } },
                disconnect: jest.fn(),
                data: {},
            };
            mockJwtService.verifyAsync.mockResolvedValue({
                sub: 'user-789',
                email: 'cookie@example.com',
                type: 'access',
            });

            await gateway.handleConnection(client);
            expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('cookie-token', expect.any(Object));
            expect(client.disconnect).not.toHaveBeenCalled();
            expect(client.data.user.userId).toBe('user-789');
        });
    });

    describe('handleJoinSession', () => {
        it('should return error if client is not authenticated', async () => {
            const client: any = { id: 'socket-1', data: {} };
            const res = await gateway.handleJoinSession({ sessionId: 'session-1' }, client);
            expect(res).toEqual({ success: false, error: 'Unauthorized' });
        });

        it('should derive player and join session successfully', async () => {
            const client: any = {
                id: 'socket-1',
                data: { user: { userId: 'user-123' } },
                join: jest.fn(),
                to: jest.fn().mockReturnValue({ emit: jest.fn() }),
            };
            mockSessionsService.findPlayerBySessionAndUser.mockResolvedValue({
                id: 'player-456',
                nickname: 'PlayerOne',
            });

            const res = await gateway.handleJoinSession({ sessionId: 'session-1' }, client);

            expect(mockSessionsService.findPlayerBySessionAndUser).toHaveBeenCalledWith('session-1', 'user-123');
            expect(client.join).toHaveBeenCalledWith('session-1');
            expect(res.success).toBe(true);
            expect(res.player).toEqual({ id: 'player-456', nickname: 'PlayerOne' });
        });
    });

    describe('handleJoinHost', () => {
        it('should deny host access if checkHostAccess throws', async () => {
            const client: any = {
                id: 'socket-1',
                data: { user: { userId: 'user-999' } },
            };
            mockSessionsService.checkHostAccess.mockRejectedValue(new Error('Forbidden'));

            const res = await gateway.handleJoinHost({ sessionId: 'session-1' }, client);
            expect(res).toEqual({ success: false, error: 'Forbidden' });
        });

        it('should allow host access if checkHostAccess succeeds', async () => {
            const client: any = {
                id: 'socket-1',
                data: { user: { userId: 'user-123' } },
                join: jest.fn(),
            };
            mockSessionsService.checkHostAccess.mockResolvedValue({});

            const res = await gateway.handleJoinHost({ sessionId: 'session-1' }, client);
            expect(client.join).toHaveBeenCalledWith('session-1');
            expect(res).toEqual({ success: true });
        });
    });

    describe('handleSubmitAnswer', () => {
        it('should submit answer with authenticated userId', async () => {
            const client: any = {
                id: 'socket-1',
                data: { user: { userId: 'user-123' } },
            };
            mockSessionsService.submitAnswer.mockResolvedValue({ id: 'resp-1' });

            const res = await gateway.handleSubmitAnswer(
                { sessionId: 'session-1', questionId: 'q-1', optionId: 'opt-1', playerId: 'player-456' },
                client,
            );

            expect(mockSessionsService.submitAnswer).toHaveBeenCalledWith(
                'session-1',
                'q-1',
                { playerId: 'player-456', optionId: 'opt-1' },
                'user-123',
            );
            expect(res).toEqual({ success: true });
        });
    });

    describe('onPlayerDisconnect', () => {
        it('should disconnect socket corresponding to playerId in payload', () => {
            const mockPlayerSocket: any = {
                leave: jest.fn(),
                disconnect: jest.fn(),
            };
            mockServer.sockets.get.mockReturnValue(mockPlayerSocket);

            // Simulate mapped player
            (gateway as any).playerToSocket.set('player-456', 'socket-1');
            (gateway as any).socketToPlayer.set('socket-1', {
                playerId: 'player-456',
                sessionId: 'session-1',
                nickname: 'PlayerOne',
            });

            gateway.onPlayerDisconnect({ playerId: 'player-456' });

            expect(mockPlayerSocket.leave).toHaveBeenCalledWith('session-1');
            expect(mockPlayerSocket.disconnect).toHaveBeenCalledWith(true);
            expect((gateway as any).playerToSocket.has('player-456')).toBe(false);
        });
    });
});
