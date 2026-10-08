import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task, TaskStatus } from './task.entity';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  // Repository giả lập để test không phụ thuộc DB
  const repo = {
    create: jest.fn((dto) => ({ ...dto })),
    save: jest.fn(async (task) => ({ id: 'uuid-1', status: TaskStatus.TODO, ...task })),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [TasksService, { provide: getRepositoryToken(Task), useValue: repo }],
    }).compile();
    service = module.get(TasksService);
  });

  it('create: tạo task mới với status mặc định', async () => {
    const task = await service.create({ title: 'Test' });
    expect(repo.save).toHaveBeenCalled();
    expect(task).toMatchObject({ id: 'uuid-1', title: 'Test', status: TaskStatus.TODO });
  });

  it('findOne: ném NotFoundException khi không tìm thấy', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('update: cập nhật field được gửi lên', async () => {
    repo.findOneBy.mockResolvedValue({ id: 'uuid-1', title: 'Cũ', status: TaskStatus.TODO });
    const task = await service.update('uuid-1', { status: TaskStatus.DONE });
    expect(task).toMatchObject({ title: 'Cũ', status: TaskStatus.DONE });
  });

  it('remove: xóa task tồn tại', async () => {
    const existing = { id: 'uuid-1', title: 'X' };
    repo.findOneBy.mockResolvedValue(existing);
    await service.remove('uuid-1');
    expect(repo.remove).toHaveBeenCalledWith(existing);
  });
});
