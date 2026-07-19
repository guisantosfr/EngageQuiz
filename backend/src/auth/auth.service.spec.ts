import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../generated/prisma/enums';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto'
import { validate } from 'class-validator';

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

describe('RegisterDto Validation', () => {
  it('should fail validation if name is empty', async () => {
    const dto = new RegisterDto();
    dto.name = '';
    dto.email = 'student@gmail.com';
    dto.password = 'password123';
    dto.role = Role.STUDENT;
    // Executa a validação manual do DTO
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);

    // Procura pelo erro na propriedade 'name'
    const nameError = errors.find(e => e.property === 'name');
    expect(nameError).toBeDefined();
  });

  it('should fail validation if email is empty', async () => {
    const dto = new RegisterDto();
    dto.name = 'Student';
    dto.email = '';
    dto.password = 'password123';
    dto.role = Role.STUDENT;
    const errors = await validate(dto);

    const emailError = errors.find(e => e.property === 'email');
    expect(emailError).toBeDefined();
  });

  it('should fail validation if email is invalid', async () => {
    const dto = new RegisterDto();
    dto.name = 'Student';
    dto.email = 'invalid-email';
    dto.password = 'password123';
    dto.role = Role.STUDENT;
    const errors = await validate(dto);

    const emailError = errors.find(e => e.property === 'email');
    expect(emailError).toBeDefined();
  });

  it('should fail validation if password is empty', async () => {
    const dto = new RegisterDto();
    dto.name = 'Student';
    dto.email = 'student@gmail.com';
    dto.password = '';
    dto.role = Role.STUDENT;
    const errors = await validate(dto);

    const passwordError = errors.find(e => e.property === 'password');
    expect(passwordError).toBeDefined();
  });

  it('should fail validation if password is too short', async () => {
    const dto = new RegisterDto();
    dto.name = 'Student';
    dto.email = 'student@gmail.com';
    dto.password = '123';
    dto.role = Role.STUDENT;
    const errors = await validate(dto);

    const passwordError = errors.find(e => e.property === 'password');
    expect(passwordError).toBeDefined();
  });

  it('should fail validation if role is empty', async () => {
    const dto = new RegisterDto();
    dto.name = 'Student';
    dto.email = 'student@gmail.com';
    dto.password = 'password123';
    dto.role = '' as Role;
    const errors = await validate(dto);

    const roleError = errors.find(e => e.property === 'role');
    expect(roleError).toBeDefined();
  });

  it('should fail validation if role is invalid', async () => {
    const dto = new RegisterDto();
    dto.name = 'Student';
    dto.email = 'student@gmail.com';
    dto.password = 'password123';
    dto.role = 'user' as Role;
    const errors = await validate(dto);

    const roleError = errors.find(e => e.property === 'role');
    expect(roleError).toBeDefined();
  });
});