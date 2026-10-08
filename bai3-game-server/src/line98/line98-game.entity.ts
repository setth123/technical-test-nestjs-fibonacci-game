import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Board } from './line98.logic';

/** Trạng thái một ván Line 98 của người chơi */
@Entity()
export class Line98Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column('simple-json')
  board: Board;

  @Column({ default: 0 })
  score: number;

  @Column({ default: false })
  gameOver: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
