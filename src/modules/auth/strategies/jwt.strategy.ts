import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { email } from 'zod';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'HyabnzyNMbhssaMZNSHh%6&',
    });
  }

  async validate(payload: any) {
    return { 
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      username: payload.username,
      roles: payload.roles 
    };
  }
}