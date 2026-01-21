import { Controller, Post, Body, Get, Param, Delete } from "@nestjs/common";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import { SessionsService } from "./sessions.service";
import { CreateSessionDto, JoinSessionDto } from "./dto";

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
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute for join
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

    @Get(':sessionId/quiz/:quizId')
    async getSessionInfo(@Param('sessionId') sessionId: string, @Param('quizId') quizId: string) {
        return this.sessionsService.getSessionData(sessionId, quizId);
    }
}