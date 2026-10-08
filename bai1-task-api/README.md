# Bài 1: Task API với NestJS

## Chạy ứng dụng
```bash
npm install
npm start          # http://localhost:3000
npm test           # chạy unit test
```
- Swagger UI: **http://localhost:3000/docs**
- Dữ liệu lưu trong SQLite `tasks.sqlite` (tự tạo khi chạy lần đầu).

## API
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/tasks` | Tạo task (`title` bắt buộc, không rỗng) |
| GET | `/tasks` | Lấy danh sách task |
| GET | `/tasks/:id` | Lấy task theo UUID |
| PATCH | `/tasks/:id` | Cập nhật task |
| DELETE | `/tasks/:id` | Xóa task |

`status` ∈ `"To Do" | "In Progress" | "Done"` (mặc định `"To Do"`).

## Cấu trúc (MVC)
```
src/
├── main.ts                    # bootstrap, ValidationPipe, Swagger
├── app.module.ts              # cấu hình TypeORM + SQLite
└── tasks/
    ├── task.entity.ts         # Model
    ├── tasks.controller.ts    # Controller: xử lý HTTP
    ├── tasks.service.ts       # Service: logic nghiệp vụ
    ├── tasks.service.spec.ts  # Unit test
    ├── tasks.module.ts
    └── dto/                   # Validate input bằng class-validator
```

## Hiểu biết về NestJS
- **Module** (`@Module`): đơn vị tổ chức code, gom các controller/provider liên quan đến một tính năng; khai báo phụ thuộc với module khác qua `imports`/`exports`.
- **Controller** (`@Controller`): nhận request HTTP, ánh xạ route → handler, trả response. Không chứa logic nghiệp vụ.
- **Service** (`@Injectable`): chứa logic nghiệp vụ và truy cập dữ liệu; được inject vào controller qua Dependency Injection.

**NestJS & TypeScript:** Nest được viết bằng TypeScript và tận dụng:
- **Decorators** (`@Controller`, `@Get`, `@Injectable`, `@Column`...) để khai báo metadata cho routing, DI, ORM, validation.
- **Kiểu tĩnh + `emitDecoratorMetadata`**: DI container đọc kiểu tham số constructor để tự inject; `ValidationPipe` dùng class DTO để validate/transform input.
- Type checking lúc biên dịch giúp phát hiện lỗi sớm và gợi ý code tốt hơn trong IDE.

## Validation (Pipes)
`ValidationPipe` toàn cục + `class-validator` trong DTO; `ParseUUIDPipe` cho tham số `:id`.
```
POST /tasks {"title": ""}
→ 400 {"message":["title should not be empty"],"error":"Bad Request","statusCode":400}
```

## Kết quả unit test
```
PASS src/tasks/tasks.service.spec.ts
  TasksService
    ✓ create: tạo task mới với status mặc định
    ✓ findOne: ném NotFoundException khi không tìm thấy
    ✓ update: cập nhật field được gửi lên
    ✓ remove: xóa task tồn tại

Tests:       4 passed, 4 total
```

## Hiệu năng
Với 100 bản ghi, `GET /tasks` phản hồi trong **~4ms** (đo bằng `curl -w %{time_total}` trên máy local), dưới mức yêu cầu 200ms.
