import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CredentialsDto } from './credentials.dto';

export interface JwtPayload {
  sub: number;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register({ username, password }: CredentialsDto) {
    if (await this.usersService.findByUsername(username)) {
      throw new ConflictException('Username đã tồn tại');
    }
    const user = await this.usersService.create(username, await bcrypt.hash(password, 10));
    return { id: user.id, username: user.username };
  }

  async login({ username, password }: CredentialsDto) {
    const user = await this.usersService.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Sai username hoặc password');
    }
    const payload: JwtPayload = { sub: user.id, username: user.username };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  /** Dùng chung cho HTTP guard và WebSocket gateway. Trả về null nếu token không hợp lệ. */
  verifyToken(token?: string): JwtPayload | null {
    try {
      return token ? this.jwtService.verify<JwtPayload>(token) : null;
    } catch {
      return null;
    }
  }
}
