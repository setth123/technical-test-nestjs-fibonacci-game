import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Line98Game } from './line98-game.entity';
import { Cell, move, newGame, randomValidMove } from './line98.logic';

@Injectable()
export class Line98Service {
  constructor(@InjectRepository(Line98Game) private readonly repo: Repository<Line98Game>) {}

  /** Lấy ván đang chơi dở (nếu có) hoặc tạo ván mới */
  async start(userId: number, forceNew = false): Promise<Line98Game> {
    if (!forceNew) {
      const current = await this.repo.findOne({ where: { userId, gameOver: false }, order: { id: 'DESC' } });
      if (current) return current;
    }
    return this.repo.save(this.repo.create({ userId, board: newGame(), score: 0 }));
  }

  async move(userId: number, from: Cell, to: Cell) {
    const game = await this.getActive(userId);
    const result = move(game.board, from, to); // ném lỗi nếu nước đi không hợp lệ
    game.score += result.cleared;
    game.gameOver = result.gameOver;
    await this.repo.save(game);
    return { game, result };
  }

  async hint(userId: number) {
    return randomValidMove((await this.getActive(userId)).board);
  }

  private async getActive(userId: number) {
    const game = await this.repo.findOne({ where: { userId, gameOver: false }, order: { id: 'DESC' } });
    if (!game) throw new NotFoundException('Không có ván đang chơi');
    return game;
  }
}
