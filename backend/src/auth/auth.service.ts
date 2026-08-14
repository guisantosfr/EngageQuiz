import { ConflictException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  private async generateTokens(user: { id: string, email: string, name: string }) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
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
          password: hashedPassword
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

  async login(loginDto: LoginDto) {
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

  async refresh(refreshDto: RefreshDto) {
    const { refreshToken } = refreshDto;

    try {
      // Validar o Refresh Token usando o JwtService
      const decoded = await this.jwtService.verifyAsync(refreshToken);

      // Buscar o usuário no banco para garantir que ele ainda existe e pegar os dados mais recentes
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado.');
      }

      // Payload atualizado
      const payload = { sub: user.id, email: user.email };

      // Emitir novo Access Token
      const newAccessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      });

      // Rotacionar Refresh Token (Emitir um novo Refresh Token)
      const newRefreshToken = await this.jwtService.signAsync(payload, {
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
