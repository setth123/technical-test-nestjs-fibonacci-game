import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../task.entity';

export class CreateTaskDto {
  @ApiProperty({ example: 'Học NestJS' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Đọc tài liệu Modules, Controllers, Services' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
