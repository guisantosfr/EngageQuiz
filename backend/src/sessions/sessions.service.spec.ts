import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('SessionsService', () => {
    let service: SessionsService;
    let prisma: PrismaService;
    let eventEmitter: EventEmitter2;

    const mockPrismaService = {
        session: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        player: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
            findMany: jest.fn(),
        },
        quiz: {
            findUnique: jest.fn(),
        },
        response: {
            findFirst: jest.fn(),
            create: jest.fn(),
            count: jest.fn(),
        },
        option: {
            findUnique: jest.fn(),
        },
        $transaction: jest.fn((cb) => cb(mockPrismaService)),
    };

    const mockEventEmitter = {
        emit: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
            ],
        }).compile();

        service = module.get<SessionsService>(SessionsService);
        prisma = module.get<PrismaService>(PrismaService);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('checkHostAccess', () => {
        it('should throw ForbiddenException if session does not exist or user is not quiz creator', async () => {
            mockPrismaService.session.findUnique.mockResolvedValue(null);
            await expect(service.checkHostAccess('sess-1', 'user-1')).rejects.toThrow(ForbiddenException);

            mockPrismaService.session.findUnique.mockResolvedValue({
                id: 'sess-1',
                quiz: { userId: 'other-user' },
            });
            await expect(service.checkHostAccess('sess-1', 'user-1')).rejects.toThrow(ForbiddenException);
        });

        it('should return session if user is host', async () => {
            const mockSession = {
                id: 'sess-1',
                quiz: { userId: 'user-1' },
            };
            mockPrismaService.session.findUnique.mockResolvedValue(mockSession);

            const res = await service.checkHostAccess('sess-1', 'user-1');
            expect(res).toEqual(mockSession);
        });
    });

    describe('findPlayerBySessionAndUser', () => {
        it('should throw NotFoundException if player not found', async () => {
            mockPrismaService.player.findFirst.mockResolvedValue(null);
            await expect(service.findPlayerBySessionAndUser('sess-1', 'user-1')).rejects.toThrow(NotFoundException);
        });

        it('should return player if found', async () => {
            const mockPlayer = { id: 'p-1', nickname: 'Nick', sessionId: 'sess-1', userId: 'user-1' };
            mockPrismaService.player.findFirst.mockResolvedValue(mockPlayer);

            const res = await service.findPlayerBySessionAndUser('sess-1', 'user-1');
            expect(res).toEqual(mockPlayer);
            expect(mockPrismaService.player.findFirst).toHaveBeenCalledWith({
                where: { sessionId: 'sess-1', userId: 'user-1', leftAt: null },
            });
        });
    });
});
