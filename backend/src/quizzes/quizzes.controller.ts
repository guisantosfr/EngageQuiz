import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateOptionDto, CreateQuizDto, UpdateQuizDto } from './dto';
import { CreateQuizAIDto } from './dto/create-quiz-ai.dto';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) { }

    @Get()
    async findAll(@CurrentUser() user: any) {
        return this.quizzesService.getAllQuizzes(user.id);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.quizzesService.getQuizById(id, user.id);
    }

    @Post()
    async create(@Body() data: CreateQuizDto, @CurrentUser() user: any) {
        return this.quizzesService.createQuiz(data, user.id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: UpdateQuizDto, @CurrentUser() user: any) {
        return this.quizzesService.updateQuiz(id, data, user.id);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.quizzesService.deleteQuiz(id, user.id);
    }

    @Post('ai/generate')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async generateAIQuiz(@Body() data: CreateQuizAIDto, @CurrentUser() user: any) {
        // Apenas para manter o padrão, mas a IA retorna um JSON, não salva no banco ainda.
        return this.quizzesService.generateQuizByAI(data, user.id);
    }

}