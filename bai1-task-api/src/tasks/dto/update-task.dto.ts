import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

// Tất cả field đều optional nhưng vẫn giữ các rule validate (vd: title không rỗng nếu có gửi)
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
