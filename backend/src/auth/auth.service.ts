import { ConflictException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../generated/prisma/client';
import {
  AccessTokenPayload,
  AuthenticatedUser,
  AuthResponse,
  AuthTokens,
  RefreshTokenPayload,
} from './types/auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  private async generateTokens(user: AuthenticatedUser): Promise<AuthResponse> {
    const accessSecret =
      this.configService.get<string>('ACCESS_TOKEN_SECRET') ||
      this.configService.get<string>('JWT_SECRET') ||
      'secretKey';

    const refreshSecret =
      this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
      this.configService.get<string>('JWT_SECRET') ||
      'secretKey';

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
      ...(user.role && { role: user.role }),
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
      ...(user.role && { role: user.role }),
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: accessSecret,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ...(user.role && { role: user.role }),
      },
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { name, email, password } = registerDto;

    // Verificar e-mail duplicado
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('O e-mail já está em uso.');
    }

    try {
      // Gerar hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Retorna as credenciais de login automaticamente (Tokens)
      return this.generateTokens(user);
    } catch (error) {
      this.logger.error(
        `Erro ao registrar usuário (${email}): ${error instanceof Error ? error.message : error}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('O e-mail já está em uso.');
        }
      }

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao criar usuário.');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Buscar usuário pelo e-mail
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    // Comparar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.generateTokens(user);
  }

  async refresh(refreshDto: RefreshDto): Promise<AuthTokens> {
    const { refreshToken } = refreshDto;

    try {
      const refreshSecret =
        this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
        this.configService.get<string>('JWT_SECRET') ||
        'secretKey';

      const accessSecret =
        this.configService.get<string>('ACCESS_TOKEN_SECRET') ||
        this.configService.get<string>('JWT_SECRET') ||
        'secretKey';

      // Validar o Refresh Token usando o JwtService com a chave de refresh
      const decoded = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        { secret: refreshSecret },
      );

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Token de atualização inválido.');
      }

      // Buscar o usuário no banco para garantir que ele ainda existe e pegar os dados mais recentes
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado.');
      }

      const userRole = (user as any).role;

      // Payload atualizado
      const accessPayload: AccessTokenPayload = {
        sub: user.id,
        email: user.email,
        type: 'access',
        ...(userRole && { role: userRole }),
      };

      const refreshPayload: RefreshTokenPayload = {
        sub: user.id,
        email: user.email,
        type: 'refresh',
        ...(userRole && { role: userRole }),
      };

      // Emitir novo Access Token
      const newAccessToken = await this.jwtService.signAsync(accessPayload, {
        secret: accessSecret,
        expiresIn: '15m',
      });

      // Rotacionar Refresh Token (Emitir um novo Refresh Token)
      const newRefreshToken = await this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: '7d',
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao renovar token: ${error instanceof Error ? error.message : error}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }
  }
}
