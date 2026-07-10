import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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

  // TODO: Implement user validation and login logic
}
