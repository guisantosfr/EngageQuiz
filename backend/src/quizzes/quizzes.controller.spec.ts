import { Test, TestingModule } from '@nestjs/testing';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

describe('QuizzesController', () => {
  let controller: QuizzesController;
  let service: QuizzesService;

  const mockQuizzesService = {
    getAllQuizzes: jest.fn(),
    getQuizById: jest.fn(),
    createQuiz: jest.fn(),
    updateQuiz: jest.fn(),
    deleteQuiz: jest.fn(),
    generateQuizByAI: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizzesController],
      providers: [
        { provide: QuizzesService, useValue: mockQuizzesService },
      ],
    }).compile();

    controller = module.get<QuizzesController>(QuizzesController);
    service = module.get<QuizzesService>(QuizzesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
