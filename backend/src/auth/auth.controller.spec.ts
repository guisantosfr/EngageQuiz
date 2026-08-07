import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with correct DTO and return the tokens', async () => {
      // 1. DTO de entrada
      const registerDto = {
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'password123'
      };
      // 2. Definimos o que o serviço de autenticação deve retornar
      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: '1', name: 'Test User', email: 'test@gmail.com' },
      };
      mockAuthService.register.mockResolvedValue(mockResult);
      // 3. Execução
      const result = await controller.register(registerDto);
      // 4. Asserções
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockResult); // Compara diretamente com a resposta mockada
    });
  });

  describe('login', () => {
    it('should call authService.login with correct DTO and return the tokens', async () => {
      const loginDto = {
        email: 'test@gmail.com',
        password: 'password123',
      };
      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: '1', name: 'Test User', email: 'test@gmail.com' },
      };
      mockAuthService.login.mockResolvedValue(mockResult);
      const result = await controller.login(loginDto);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh with correct DTO and return the tokens', async () => {
      // 1. Defina como um objeto DTO e não apenas uma string
      const refreshDto = {
        refreshToken: 'refresh-token',
      };

      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: '1', name: 'Test User', email: 'test@gmail.com' },
      };

      mockAuthService.refresh.mockResolvedValue(mockResult);

      // 2. Passe o DTO para o controller
      const result = await controller.refresh(refreshDto);

      expect(mockAuthService.refresh).toHaveBeenCalledTimes(1);
      expect(mockAuthService.refresh).toHaveBeenCalledWith(refreshDto);
      expect(result).toEqual(mockResult);
    });
  });

});
