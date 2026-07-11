import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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
      // Definir role padrão = STUDENT (já garantido pelo schema do Prisma)
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
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
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

    // Payload
    const payload = { sub: user.id, email: user.email, role: user.role };

    // Gerar Access Token e Refresh Token
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
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshDto: RefreshDto) {
    const { refreshToken } = refreshDto;

    try {
      // Validar o Refresh Token usando o JwtService
      const decoded = await this.jwtService.verifyAsync(refreshToken);

      // Buscar o usuário no banco para garantir que ele ainda existe e pegar os dados mais recentes (ex: nova role)
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado.');
      }

      // Payload atualizado
      const payload = { sub: user.id, email: user.email, role: user.role };

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
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Retornar sucesso genérico por segurança
      return { message: 'Se o e-mail existir, um link de recuperação será enviado.' };
    }

    // Gerar token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora no futuro

    // Atualizar usuário
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    // Configurar nodemailer (usando fallback para não quebrar localmente)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    try {
      await transporter.sendMail({
        from: '"EngageQuiz" <noreply@engagequiz.com>',
        to: user.email,
        subject: 'Recuperação de Senha',
        html: `
          <h1>Você solicitou a redefinição de senha</h1>
          <p>Clique no link abaixo para criar uma nova senha. Este link é válido por 1 hora.</p>
          <a href="${resetURL}">${resetURL}</a>
        `,
      });
      // Apenas para facilitar durante o desenvolvimento
      console.log('Token de reset:', resetToken); 
    } catch (error) {
      console.error('Erro ao enviar e-mail. Token:', resetToken);
      console.error(error);
    }

    return { message: 'Se o e-mail existir, um link de recuperação será enviado.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Fazer o hash do token recebido para comparar com o do banco
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    // Gerar hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e limpar campos de reset
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { message: 'Senha redefinida com sucesso.' };
  }
}
