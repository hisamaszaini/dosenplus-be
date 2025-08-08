import { 
  Body, 
  Controller, 
  HttpCode, 
  HttpStatus, 
  Post, 
  Query, 
  Request, 
  UseGuards 
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { LoginDto } from '../users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() dto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  resetPassword(
    @Query('token') token: string,
    @Body('password') pass: string,
  ) {
    return this.authService.resetPassword(token, pass);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refreshTokens(@Request() req) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    const userId = req.user.sub;
    await this.authService.logout(userId);

    return {
      message: 'Logout berhasil',
      statusCode: HttpStatus.OK,
    };
  }
}
