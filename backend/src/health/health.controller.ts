import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@Controller()
export class HealthController {
    @Get('healthz')
    @SkipThrottle()
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
}
