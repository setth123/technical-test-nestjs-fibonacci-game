import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'tasks.sqlite',
      autoLoadEntities: true,
      synchronize: true, // tự tạo bảng (chỉ dùng cho môi trường dev)
    }),
    TasksModule,
  ],
})
export class AppModule {}
