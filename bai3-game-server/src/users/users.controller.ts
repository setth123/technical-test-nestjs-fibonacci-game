import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthRequest } from '../auth/auth.guard';
import { UpdateProfileDto } from './update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard) // chỉ user đã đăng nhập
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@Req() req: AuthRequest) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Patch('me')
  update(@Req() req: AuthRequest, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, dto);
  }
}
