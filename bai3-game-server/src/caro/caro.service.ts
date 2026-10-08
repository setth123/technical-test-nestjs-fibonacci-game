import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaroMatch } from './caro-match.entity';
import { Board, emptyBoard, isBoardFull, isWinningMove, Symbol } from './caro.logic';

export interface Player {
  socketId: string;
  userId: number;
  username: string;
}

export interface Room {
  id: string;
  board: Board;
  players: Record<Symbol, Player>;
  turn: Symbol;
  moves: { r: number; c: number; symbol: Symbol }[];
}

/** Quản lý hàng chờ ghép cặp, các phòng đang chơi (trong RAM) và lưu lịch sử vào DB */
@Injectable()
export class CaroService {
  private waiting: Player | null = null;
  private rooms = new Map<string, Room>();
  private roomOfSocket = new Map<string, string>();
  private nextRoomId = 1;

  constructor(@InjectRepository(CaroMatch) private readonly repo: Repository<CaroMatch>) {}

  /** Thêm người chơi vào hàng chờ; nếu đã có người chờ thì ghép cặp và trả về phòng mới */
  joinQueue(player: Player): Room | null {
    if (this.roomOfSocket.has(player.socketId)) return null; // đang trong trận
    if (!this.waiting || this.waiting.socketId === player.socketId) {
      this.waiting = player;
      return null;
    }
    // Ngẫu nhiên ai cầm X (đi trước)
    const [x, o] = Math.random() < 0.5 ? [this.waiting, player] : [player, this.waiting];
    this.waiting = null;
    const room: Room = { id: `caro-${this.nextRoomId++}`, board: emptyBoard(), players: { X: x, O: o }, turn: 'X', moves: [] };
    this.rooms.set(room.id, room);
    this.roomOfSocket.set(x.socketId, room.id);
    this.roomOfSocket.set(o.socketId, room.id);
    return room;
  }

  /** Đánh một nước. Trả về kết quả nếu ván kết thúc. Ném lỗi nếu nước đi không hợp lệ. */
  async play(socketId: string, r: number, c: number) {
    const room = this.getRoomOf(socketId);
    if (!room) throw new Error('Bạn chưa ở trong trận');
    const symbol = room.players.X.socketId === socketId ? 'X' : 'O';
    if (room.turn !== symbol) throw new Error('Chưa đến lượt của bạn');
    if (!Number.isInteger(r) || !Number.isInteger(c) || room.board[r]?.[c] !== null) throw new Error('Ô không hợp lệ');

    room.board[r][c] = symbol;
    room.moves.push({ r, c, symbol });
    room.turn = symbol === 'X' ? 'O' : 'X';

    let result: Symbol | 'draw' | null = null;
    if (isWinningMove(room.board, r, c)) result = symbol;
    else if (isBoardFull(room.board)) result = 'draw';
    if (result) await this.finish(room, result);
    return { room, symbol, result };
  }

  /** Người chơi rời đi: xóa khỏi hàng chờ, hoặc xử thua nếu đang trong trận */
  async leave(socketId: string) {
    if (this.waiting?.socketId === socketId) this.waiting = null;
    const room = this.getRoomOf(socketId);
    if (!room) return null;
    const winner: Symbol = room.players.X.socketId === socketId ? 'O' : 'X';
    await this.finish(room, winner);
    return { room, winner };
  }

  getRoomOf(socketId: string) {
    const id = this.roomOfSocket.get(socketId);
    return id ? this.rooms.get(id) : undefined;
  }

  history(userId: number) {
    return this.repo.find({
      where: [{ playerXId: userId }, { playerOId: userId }],
      order: { id: 'DESC' },
      take: 20,
    });
  }

  private async finish(room: Room, result: Symbol | 'draw') {
    this.rooms.delete(room.id);
    this.roomOfSocket.delete(room.players.X.socketId);
    this.roomOfSocket.delete(room.players.O.socketId);
    await this.repo.save(
      this.repo.create({ playerXId: room.players.X.userId, playerOId: room.players.O.userId, result, moves: room.moves }),
    );
  }
}
