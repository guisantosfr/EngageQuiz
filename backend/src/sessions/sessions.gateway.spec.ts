import { Test, TestingModule } from '@nestjs/testing';
import { SessionsGateway } from './sessions.gateway';
import { SessionsService } from './sessions.service';

describe('SessionsGateway', () => {
  let gateway: SessionsGateway;
  let service: SessionsService;

  const mockSessionsService = {
    submitAnswer: jest.fn(),
  };

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsGateway,
        { provide: SessionsService, useValue: mockSessionsService },
      ],
    }).compile();

    gateway = module.get<SessionsGateway>(SessionsGateway);
    service = module.get<SessionsService>(SessionsService);

    // Mock WebSocket Server
    gateway.server = mockServer as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
