import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredentialsDto } from './credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: CredentialsDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: CredentialsDto) {
    return this.authService.login(dto);
  }
}
