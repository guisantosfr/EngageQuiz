import { Controller, Post, Body, Get, Param, Delete } from "@nestjs/common";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import { SessionsService } from "./sessions.service";
import { CreateSessionDto, JoinSessionDto, SubmitAnswerDto } from "./dto";
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('sessions')
export class SessionsController {
    constructor(
        private readonly sessionsService: SessionsService,
    ) { }

    @Post()
    async create(@Body() createSessionDto: CreateSessionDto, @CurrentUser() user: any) {
        return this.sessionsService.create(createSessionDto, user.userId);
    }

    @Post(':code/join')
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute for join
    async join(
        @Param('code') code: string,
        @Body() joinSessionDto: JoinSessionDto,
        @CurrentUser() user: any,
    ) {
        return this.sessionsService.join(code, joinSessionDto, user.userId);
    }

    @Get(':id/players')
    @SkipThrottle()
    async getSessionPlayers(@Param('id') sessionId: string, @CurrentUser() user: any) {
        return this.sessionsService.getSessionPlayers(sessionId, user.userId);
    }

    @Delete(':id')
    async cancel(@Param('id') sessionId: string, @CurrentUser() user: any) {
        return this.sessionsService.cancel(sessionId, user.userId);
    }

    @Delete(':sessionId/players/:playerId/leave')
    async leaveSession(
        @Param('sessionId') sessionId: string,
        @Param('playerId') playerId: string,
        @CurrentUser() user: any,
    ) {
        return this.sessionsService.removePlayer(sessionId, playerId, false, user.userId);
    }

    @Delete(':sessionId/players/:playerId/kick')
    async kickPlayer(
        @Param('sessionId') sessionId: string,
        @Param('playerId') playerId: string,
        @CurrentUser() user: any,
    ) {
        return this.sessionsService.removePlayer(sessionId, playerId, true, user.userId);
    }

    @Get(':sessionId/player/:playerId')
    async getSessionPlayerInfo(@Param('sessionId') sessionId: string, @Param('playerId') playerId: string, @CurrentUser() user: any) {
        return this.sessionsService.getSessionPlayerData(sessionId, playerId, user.userId);
    }

    @Get(':sessionId/quiz/:quizId')
    async getSessionFullInfo(@Param('sessionId') sessionId: string, @Param('quizId') quizId: string, @CurrentUser() user: any) {
        return this.sessionsService.getSessionFullData(sessionId, quizId, user.userId);
    }

    @Post(':id/start')
    async start(@Param('id') sessionId: string, @CurrentUser() user: any) {
        return this.sessionsService.start(sessionId, user.userId);
    }

    @Post(':id/next-question')
    async nextQuestion(@Param('id') sessionId: string, @CurrentUser() user: any) {
        return this.sessionsService.nextQuestion(sessionId, user.userId);
    }

    @Post(':id/questions/:questionId/answer')
    async submitAnswer(
        @Param('id') sessionId: string,
        @Param('questionId') questionId: string,
        @Body() submitAnswerDto: SubmitAnswerDto,
        @CurrentUser() user: any,
    ) {
        return this.sessionsService.submitAnswer(sessionId, questionId, submitAnswerDto, user.userId);
    }

    @Post(':id/finish')
    async finish(@Param('id') sessionId: string, @CurrentUser() user: any) {
        return this.sessionsService.finish(sessionId, user.userId);
    }

    @Get(':id/results')
    async getSessionResults(@Param('id') sessionId: string, @CurrentUser() user: any) {
        return this.sessionsService.getSessionResults(sessionId, user.userId);
    }

    @Get(':id/results/:playerId')
    async getPlayerResults(
        @Param('id') sessionId: string,
        @Param('playerId') playerId: string,
        @CurrentUser() user: any,
    ) {
        return this.sessionsService.getPlayerResults(sessionId, playerId, user.userId);
    }
}