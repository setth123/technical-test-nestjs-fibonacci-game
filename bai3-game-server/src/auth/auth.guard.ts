import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService, JwtPayload } from './auth.service';

export type AuthRequest = Request & { user: JwtPayload };

/** Kiểm tra header "Authorization: Bearer <token>" */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const token = req.headers.authorization?.replace(/^Bearer /, '');
    const payload = this.authService.verifyToken(token);
    if (!payload) throw new UnauthorizedException();
    req.user = payload;
    return true;
  }
}
