import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    // Set a dummy DATABASE_URL so the constructor doesn't throw
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock';

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);

    // Restore env
    if (originalUrl) {
      process.env.DATABASE_URL = originalUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
