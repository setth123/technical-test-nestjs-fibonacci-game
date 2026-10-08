import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private readonly repo: Repository<Task>) {}

  create(dto: CreateTaskDto): Promise<Task> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Task[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.repo.findOneBy({ id });
    if (!task) throw new NotFoundException(`Task ${id} không tồn tại`);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    return this.repo.save(Object.assign(task, dto));
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.repo.remove(task);
  }
}
