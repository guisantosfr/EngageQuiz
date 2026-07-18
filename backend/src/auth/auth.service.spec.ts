import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../generated/prisma/enums';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },

    $transaction: jest.fn((callback: (prisma: any) => any) => callback(mockPrismaService)),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new admin', async () => {
    const dto = {
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'password123',
      role: Role.ADMIN
    };

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const createdUserFromDb = {
      id: '1',
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockPrismaService.user.create.mockResolvedValue(createdUserFromDb);
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockJwtService.signAsync.mockResolvedValue('token');

    const result = await service.register(dto);

    expect(mockPrismaService.user.create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        email: dto.email,
        password: expect.any(String),
        role: dto.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const passwordSent = mockPrismaService.user.create.mock.calls[0][0].data.password;
    expect(await bcrypt.compare(dto.password, passwordSent)).toBe(true);


    // Valida se o JwtService assinou os dois tokens (Access e Refresh) com o payload correto
    expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { sub: createdUserFromDb.id, email: createdUserFromDb.email, role: createdUserFromDb.role },
      { expiresIn: '15m' }
    );
    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: createdUserFromDb.id, email: createdUserFromDb.email, role: createdUserFromDb.role },
      { expiresIn: '7d' }
    );

    // Valida se o retorno do método está no formato correto (sem o password no user)
    expect(result).toEqual({
      user: {
        id: createdUserFromDb.id,
        name: createdUserFromDb.name,
        email: createdUserFromDb.email,
        role: createdUserFromDb.role,
      },
      accessToken: 'token',
      refreshToken: 'token',
    });
  })


  it('should register a new teacher', async () => {
    const dto = {
      name: 'Teacher',
      email: 'teacher@gmail.com',
      password: 'password123',
      role: Role.TEACHER
    };

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const createdUserFromDb = {
      id: '1',
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockPrismaService.user.create.mockResolvedValue(createdUserFromDb);
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockJwtService.signAsync.mockResolvedValue('token');

    const result = await service.register(dto);

    expect(mockPrismaService.user.create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        email: dto.email,
        password: expect.any(String),
        role: dto.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const passwordSent = mockPrismaService.user.create.mock.calls[0][0].data.password;
    expect(await bcrypt.compare(dto.password, passwordSent)).toBe(true);


    // Valida se o JwtService assinou os dois tokens (Access e Refresh) com o payload correto
    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { sub: createdUserFromDb.id, email: createdUserFromDb.email, role: createdUserFromDb.role },
      { expiresIn: '15m' }
    );
    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: createdUserFromDb.id, email: createdUserFromDb.email, role: createdUserFromDb.role },
      { expiresIn: '7d' }
    );

    // Valida se o retorno do método está no formato correto (sem o password no user)
    expect(result).toEqual({
      user: {
        id: createdUserFromDb.id,
        name: createdUserFromDb.name,
        email: createdUserFromDb.email,
        role: createdUserFromDb.role,
      },
      accessToken: 'token',
      refreshToken: 'token',
    });
  })


  it('should register a new student', async () => {
    const dto = {
      name: 'Student',
      email: 'student@gmail.com',
      password: 'password123',
      role: Role.STUDENT
    };

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const createdUserFromDb = {
      id: '1',
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockPrismaService.user.create.mockResolvedValue(createdUserFromDb);
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockJwtService.signAsync.mockResolvedValue('token');

    const result = await service.register(dto);

    expect(mockPrismaService.user.create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        email: dto.email,
        password: expect.any(String),
        role: dto.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const passwordSent = mockPrismaService.user.create.mock.calls[0][0].data.password;
    expect(await bcrypt.compare(dto.password, passwordSent)).toBe(true);


    // Valida se o JwtService assinou os dois tokens (Access e Refresh) com o payload correto
    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { sub: createdUserFromDb.id, email: createdUserFromDb.email, role: createdUserFromDb.role },
      { expiresIn: '15m' }
    );
    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: createdUserFromDb.id, email: createdUserFromDb.email, role: createdUserFromDb.role },
      { expiresIn: '7d' }
    );

    // Valida se o retorno do método está no formato correto (sem o password no user)
    expect(result).toEqual({
      user: {
        id: createdUserFromDb.id,
        name: createdUserFromDb.name,
        email: createdUserFromDb.email,
        role: createdUserFromDb.role,
      },
      accessToken: 'token',
      refreshToken: 'token',
    });
  })
});
