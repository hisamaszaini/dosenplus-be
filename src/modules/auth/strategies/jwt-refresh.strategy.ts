import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const refreshTokenCookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['refreshToken'];
  }
  return null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super(<StrategyOptionsWithRequest>{
      jwtFromRequest: refreshTokenCookieExtractor,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.cookies.refreshToken;
    return {
      ...payload,
      refreshToken
    };
  }
}