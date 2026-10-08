import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthRequest } from '../auth/auth.guard';
import { CaroService } from './caro.service';

@Controller('caro')
@UseGuards(AuthGuard)
export class CaroController {
  constructor(private readonly caroService: CaroService) {}

  /** Lịch sử 20 trận gần nhất của user */
  @Get('history')
  history(@Req() req: AuthRequest) {
    return this.caroService.history(req.user.sub);
  }
}
