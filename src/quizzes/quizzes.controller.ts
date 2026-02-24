import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto } from './dto';
import { CreateQuizAIDto } from './dto/create-quiz-ai.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) { }

    @Get()
    async findAll() {
        return this.quizzesService.getAllQuizzes();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.quizzesService.getQuizById(id);
    }

    @Post()
    async create(@Body() data: CreateQuizDto) {
        return this.quizzesService.createQuiz(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: UpdateQuizDto) {
        return this.quizzesService.updateQuiz(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.quizzesService.deleteQuiz(id);
    }

    @Post('ai/generate')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async generateAIQuiz(@Body() data: CreateQuizAIDto) {
        return this.quizzesService.generateQuizByAI(data);
    }

}