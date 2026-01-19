import { Controller, Post, Body, Get, Param, Delete } from "@nestjs/common";
import { SessionsService } from "./sessions.service";
import { SessionsGateway } from "./sessions.gateway";
import { CreateSessionDto, JoinSessionDto } from "./dto";

@Controller('sessions')
export class SessionsController {
    constructor(
        private readonly sessionsService: SessionsService,
        private readonly sessionsGateway: SessionsGateway,
    ) { }

    @Post()
    async create(@Body() createSessionDto: CreateSessionDto) {
        return this.sessionsService.create(createSessionDto);
    }

    @Post('join')
    async join(@Body() joinSessionDto: JoinSessionDto) {
        const result = await this.sessionsService.join(joinSessionDto);

        this.sessionsGateway.emitPlayerJoined(result.session.id, {
            playerId: result.player.id,
            nickname: result.player.nickname,
            joinedAt: result.player.joinedAt,
        });

        return result;
    }

    @Get(':id/players')
    async getSessionPlayers(@Param('id') sessionId: string) {
        return this.sessionsService.getSessionPlayers(sessionId);
    }

    @Delete(':id')
    async cancel(@Param('id') sessionId: string) {
        const result = await this.sessionsService.cancel(sessionId);

        this.sessionsGateway.emitSessionCanceled(sessionId);

        return result;
    }

    @Delete('players/:id/leave')
    async leaveSession(@Param('id') playerId: string) {
        const result = await this.sessionsService.leaveSession(playerId);

        this.sessionsGateway.emitPlayerLeft(result.sessionId, {
            playerId: result.player.id,
            nickname: result.player.nickname,
        });

        return result.player;
    }

    @Delete('players/:id/kick')
    async kickPlayer(@Param('id') playerId: string) {
        const result = await this.sessionsService.kickPlayer(playerId);

        this.sessionsGateway.emitPlayerKicked(result.sessionId, {
            playerId: result.player.id,
            nickname: result.player.nickname,
        });

        return result.player;
    }
}