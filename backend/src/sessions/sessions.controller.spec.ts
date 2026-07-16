import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

describe('SessionsController', () => {
  let controller: SessionsController;
  let service: SessionsService;

  const mockSessionsService = {
    create: jest.fn(),
    join: jest.fn(),
    getSessionPlayers: jest.fn(),
    cancel: jest.fn(),
    removePlayer: jest.fn(),
    getSessionPlayerData: jest.fn(),
    getSessionFullData: jest.fn(),
    start: jest.fn(),
    submitAnswer: jest.fn(),
    nextQuestion: jest.fn(),
    finish: jest.fn(),
    getSessionResults: jest.fn(),
    getPlayerResults: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        { provide: SessionsService, useValue: mockSessionsService },
      ],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
    service = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
