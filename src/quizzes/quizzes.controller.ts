import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';

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
    async create(@Body() data: any) {
        return this.quizzesService.createQuiz(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any) {
        return this.quizzesService.updateQuiz(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.quizzesService.deleteQuiz(id);
    }

}