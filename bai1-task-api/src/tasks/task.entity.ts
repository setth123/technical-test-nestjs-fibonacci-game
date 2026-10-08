import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

// Model: schema của bảng task
@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: '' })
  description: string;

  @Column({ type: 'varchar', default: TaskStatus.TODO })
  status: TaskStatus;

  @CreateDateColumn()
  createdAt: Date;
}
