import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './update-profile.dto';
import { User } from './user.entity';

export type PublicUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  findByUsername(username: string) {
    return this.repo.findOneBy({ username });
  }

  create(username: string, passwordHash: string) {
    return this.repo.save(this.repo.create({ username, passwordHash, nickname: username }));
  }

  async getProfile(id: number): Promise<PublicUser> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException('User không tồn tại');
    const { passwordHash, ...profile } = user;
    return profile;
  }

  async updateProfile(id: number, dto: UpdateProfileDto): Promise<PublicUser> {
    await this.repo.update(id, dto);
    return this.getProfile(id);
  }
}
