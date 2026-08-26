import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class HealthController {
    @Public()
    @Get('healthz')
    @SkipThrottle()
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
}
