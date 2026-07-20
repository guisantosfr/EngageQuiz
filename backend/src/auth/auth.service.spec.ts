import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../generated/prisma/enums';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { validate } from 'class-validator';
import { UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';

describe('Register Tests', () => {
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

  it('should register a new user', async () => {
    const dto = {
      name: 'User',
      email: 'user@gmail.com',
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

  it('should not register a user if the email already exists', async () => {
    const dto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: Role.STUDENT,
    };

    const existingUser = {
      id: '1',
      email: dto.email,
      password: 'password123',
      name: 'Test User',
      role: Role.STUDENT,
    };

    mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

    await expect(service.register(dto)).rejects.toThrow(ConflictException);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
  })

  it('should throw InternalServerError if an unexpected error occurs', async () => {
    const dto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: Role.STUDENT,
    };

    // 1. A busca por e-mail único funciona (indica que não há conflito)
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    // 2. O erro acontece na hora de salvar o usuário no banco
    mockPrismaService.user.create.mockRejectedValue(new Error('Database error'));

    await expect(service.register(dto)).rejects.toThrow(InternalServerErrorException);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email },
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

describe('Login Tests', () => {
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

  it('should log in a user', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const user = {
      id: '1',
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      name: 'Test User',
      role: Role.STUDENT,
    };

    mockPrismaService.user.findUnique.mockResolvedValue(user);
    mockJwtService.signAsync.mockResolvedValue('token');

    const result = await service.login(dto);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email }
    });

    expect(result).toEqual({
      accessToken: 'token',
      refreshToken: 'token',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  })

  it('should not log in a user if the email does not exist', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email }
    });
  })

  it('should not log in a user if the password is incorrect', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const user = {
      id: '1',
      email: dto.email,
      password: 'wrongPassword',
      name: 'Test User',
      role: Role.STUDENT,
    };

    mockPrismaService.user.findUnique.mockResolvedValue(user);

    await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email }
    });
  })

})

describe('LoginDto Validation', () => {
  it('should fail validation if email is empty', async () => {
    const dto = new LoginDto();
    dto.email = '';
    dto.password = 'password123';
    const errors = await validate(dto);

    const emailError = errors.find(e => e.property === 'email');
    expect(emailError).toBeDefined();
  })

  it('should fail validation if email is invalid', async () => {
    const dto = new LoginDto();
    dto.email = 'invalid-email';
    dto.password = 'password123';
    const errors = await validate(dto);

    const emailError = errors.find(e => e.property === 'email');
    expect(emailError).toBeDefined();
  })

  it('should fail validation if password is empty', async () => {
    const dto = new LoginDto();
    dto.email = 'test@example.com';
    dto.password = '';
    const errors = await validate(dto);

    const passwordError = errors.find(e => e.property === 'password');
    expect(passwordError).toBeDefined();
  })

  it('should fail validation if password is too short', async () => {
    const dto = new LoginDto();
    dto.email = 'test@example.com';
    dto.password = '123';
    const errors = await validate(dto);

    const passwordError = errors.find(e => e.property === 'password');
    expect(passwordError).toBeDefined();
  })

})

describe('Refresh tests', () => {
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

  it('should emit new tokens if refresh token is valid', async () => {
    const dto = {
      refreshToken: 'validRefreshToken',
    };
    const user = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: Role.STUDENT,
    };
    // 1. O token decodificado precisa retornar o campo 'sub'
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: user.id,
    });
    // 2. Mockamos a busca do usuário no banco
    mockPrismaService.user.findUnique.mockResolvedValue(user);
    // 3. Usamos mockResolvedValueOnce para definir retornos diferentes na 1ª e 2ª chamada
    mockJwtService.signAsync
      .mockResolvedValueOnce('newAccessToken')
      .mockResolvedValueOnce('newRefreshToken');
    const result = await service.refresh(dto);
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(dto.refreshToken);

    // 4. Corrigimos o payload esperado na assinatura
    expect(mockJwtService.signAsync).toHaveBeenCalledWith(
      { sub: user.id, email: user.email, role: user.role },
      expect.any(Object)
    );
    // 5. Corrigimos o objeto de retorno esperado (apenas tokens, sem o user)
    expect(result).toEqual({
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
    });
  });

  it('should throw error if refresh token is expired or invalid', async () => {
    const dto = {
      refreshToken: 'invalidRefreshToken',
    };

    mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid refresh token'));

    await expect(service.refresh(dto)).rejects.toThrow(UnauthorizedException);

    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(dto.refreshToken);
  })

  it('should not refresh if user associated to token is deleted', async () => {
    const dto = {
      refreshToken: 'validRefreshToken',
    };
    const user = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: Role.STUDENT,
    };
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: user.id,
    });
    // Simulamos que o usuário foi deletado e não existe mais no banco
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    // O serviço deve rejeitar com UnauthorizedException
    await expect(service.refresh(dto)).rejects.toThrow(UnauthorizedException);
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(dto.refreshToken);
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: user.id }
    });
  });
})