import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { QuizzesModule } from './quizzes/quizzes.module';

@Module({
  imports: [PrismaModule, QuizzesModule],
})
export class AppModule {}