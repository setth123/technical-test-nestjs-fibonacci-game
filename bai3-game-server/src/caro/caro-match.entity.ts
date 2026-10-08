import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Lịch sử một trận Caro đã kết thúc */
@Entity()
export class CaroMatch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  playerXId: number;

  @Column()
  playerOId: number;

  /** 'X' | 'O' | 'draw' */
  @Column()
  result: string;

  /** Danh sách nước đi theo thứ tự: [{r, c, symbol}] */
  @Column('simple-json')
  moves: { r: number; c: number; symbol: string }[];

  @CreateDateColumn()
  createdAt: Date;
}
