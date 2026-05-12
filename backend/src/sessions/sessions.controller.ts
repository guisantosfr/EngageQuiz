import { Controller, Post, Body, Get, Param, Delete } from "@nestjs/common";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import { SessionsService } from "./sessions.service";
import { CreateSessionDto, JoinSessionDto, SubmitAnswerDto } from "./dto";

@Controller('sessions')
export class SessionsController {
    constructor(
        private readonly sessionsService: SessionsService,
    ) { }

    @Post()
    async create(@Body() createSessionDto: CreateSessionDto) {
        return this.sessionsService.create(createSessionDto);
    }

    @Post(':code/join')
    //@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute for join
    async join(
        @Param('code') code: string,
        @Body() joinSessionDto: JoinSessionDto,
    ) {
        return this.sessionsService.join(code, joinSessionDto);
    }

    @Get(':id/players')
    @SkipThrottle()
    async getSessionPlayers(@Param('id') sessionId: string) {
        return this.sessionsService.getSessionPlayers(sessionId);
    }

    @Delete(':id')
    async cancel(@Param('id') sessionId: string) {
        return this.sessionsService.cancel(sessionId);
    }

    @Delete(':sessionId/players/:playerId/leave')
    async leaveSession(
        @Param('sessionId') sessionId: string,
        @Param('playerId') playerId: string,
    ) {
        return this.sessionsService.removePlayer(sessionId, playerId, false);
    }

    @Delete(':sessionId/players/:playerId/kick')
    async kickPlayer(
        @Param('sessionId') sessionId: string,
        @Param('playerId') playerId: string,
    ) {
        return this.sessionsService.removePlayer(sessionId, playerId, true);
    }

    @Get(':sessionId/player/:playerId')
    async getSessionPlayerInfo(@Param('sessionId') sessionId: string, @Param('playerId') playerId: string) {
        return this.sessionsService.getSessionPlayerData(sessionId, playerId);
    }

    @Get(':sessionId/quiz/:quizId')
    async getSessionFullInfo(@Param('sessionId') sessionId: string, @Param('quizId') quizId: string) {
        return this.sessionsService.getSessionFullData(sessionId, quizId);
    }

    @Post(':id/start')
    async start(@Param('id') sessionId: string) {
        return this.sessionsService.start(sessionId);
    }

    @Post(':id/next-question')
    async nextQuestion(@Param('id') sessionId: string) {
        return this.sessionsService.nextQuestion(sessionId);
    }

    @Post(':id/questions/:questionId/answer')
    async submitAnswer(
        @Param('id') sessionId: string,
        @Param('questionId') questionId: string,
        @Body() submitAnswerDto: SubmitAnswerDto,
    ) {
        return this.sessionsService.submitAnswer(sessionId, questionId, submitAnswerDto);
    }

    @Post(':id/finish')
    async finish(@Param('id') sessionId: string) {
        return this.sessionsService.finish(sessionId);
    }

    @Get(':id/results')
    async getSessionResults(@Param('id') sessionId: string) {
        return this.sessionsService.getSessionResults(sessionId);
    }

    @Get(':id/results/:playerId')
    async getPlayerResults(
        @Param('id') sessionId: string,
        @Param('playerId') playerId: string,
    ) {
        return this.sessionsService.getPlayerResults(sessionId, playerId);
    }
}