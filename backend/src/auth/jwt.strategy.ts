import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayload } from './types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('ACCESS_TOKEN_SECRET') ||
        configService.get<string>('JWT_SECRET') ||
        'secretKey',
    });
  }

  async validate(payload: AccessTokenPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Token de acesso inválido.');
    }

    return {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      ...(payload.role && { role: payload.role }),
    };
  }
}