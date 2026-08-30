import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto } from './dto';
import { CreateQuizAIDto } from './dto/create-quiz-ai.dto';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/auth.types';

@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) { }

    @Get()
    async findAll(@CurrentUser() user: AuthenticatedUser) {
        return this.quizzesService.getAllQuizzes(user.userId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.quizzesService.getQuizById(id, user.userId);
    }

    @Post()
    async create(@Body() data: CreateQuizDto, @CurrentUser() user: AuthenticatedUser) {
        return this.quizzesService.createQuiz(data, user.userId);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: UpdateQuizDto, @CurrentUser() user: AuthenticatedUser) {
        return this.quizzesService.updateQuiz(id, data, user.userId);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.quizzesService.deleteQuiz(id, user.userId);
    }

    @Post('ai/generate')
    @Throttle({ strict: { limit: 5, ttl: 60000 } })
    async generateAIQuiz(@Body() data: CreateQuizAIDto, @CurrentUser() user: AuthenticatedUser) {
        // Apenas para manter o padrão, mas a IA retorna um JSON, não salva no banco ainda.
        return this.quizzesService.generateQuizByAI(data, user.userId);
    }

}