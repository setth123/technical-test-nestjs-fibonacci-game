# Bài 3: Server Game với NestJS (Line 98 + Cờ Caro)

## Chạy ứng dụng
```bash
npm install
npm start            # http://localhost:3002  (đổi cổng: PORT=4000 npm start)
npm test             # unit test
npm run load-test    # (khi server đang chạy) mô phỏng 10 người chơi đồng thời
```
Mở **http://localhost:3002** → đăng ký → đăng nhập → chọn game.
Để chơi Caro với chính mình: mở thêm 1 cửa sổ ẩn danh, đăng nhập tài khoản khác, cả hai bấm "Tìm trận".

Biến môi trường: `PORT` (mặc định 3002), `JWT_SECRET` (mặc định chuỗi dev).
Dữ liệu lưu trong SQLite `game.sqlite` (tự tạo).

## Cấu trúc
```
src/
├── auth/        # đăng ký, đăng nhập (bcrypt + JWT), AuthGuard
├── users/       # User entity, GET/PATCH /users/me
├── line98/      # line98.logic.ts (logic thuần), service (lưu DB), gateway (WebSocket)
└── caro/        # caro.logic.ts, service (ghép cặp, phòng, lịch sử), gateway, controller
public/          # client: HTML + Canvas thuần (index, line98, caro)
scripts/load-test.js
```
Mô hình MVC: **Model** = entity TypeORM, **Controller/Gateway** = nhận HTTP/WebSocket, **Service** = nghiệp vụ, **View** = client trong `public/`.
Logic game được tách thành hàm thuần (`*.logic.ts`) để dễ unit test.

## API HTTP
| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/auth/register` | | `{username, password}` |
| POST | `/auth/login` | | trả về `{accessToken}` |
| GET | `/users/me` | Bearer | thông tin cá nhân |
| PATCH | `/users/me` | Bearer | `{email?, nickname?}` |
| GET | `/caro/history` | Bearer | 20 trận Caro gần nhất |

## WebSocket (Socket.IO, gửi token qua `auth: { token }`)
**Namespace `/line98`**
- client → `start {newGame?}`, `move {from:{r,c}, to:{r,c}}`, `hint`
- server → `state {board, score, gameOver, lastMove?}`, `hint {from, to}`, `error_message`

**Namespace `/caro`**
- client → `find_match`, `move {r, c}`
- server → `waiting`, `match_start {symbol, opponent}`, `moved {r, c, symbol, turn}`, `game_over {result, reason}`, `error_message`

## Luật chơi đã cài đặt
**Line 98**: lưới 9x9, 5 màu. Bóng chỉ di chuyển được nếu có đường đi qua các ô trống (BFS, 4 hướng).
Hàng ≥ 5 bóng cùng màu (ngang/dọc/chéo) bị xóa, mỗi bóng +1 điểm. Sau mỗi lượt sinh 3 bóng ngẫu nhiên. Hết ô trống → kết thúc.
Trạng thái ván được lưu DB sau mỗi nước, tải lại trang sẽ chơi tiếp. Nút **Trợ giúp** tô sáng một nước đi hợp lệ ngẫu nhiên.
Hiệu ứng: bóng được chọn phóng to theo nhịp, bóng di chuyển chạy theo đường đi.

**Caro**: bàn 15x15, X đi trước (ngẫu nhiên ai cầm X), 5 quân liên tiếp thắng.
Ghép cặp ngẫu nhiên qua hàng chờ. Server kiểm tra lượt và ô hợp lệ. Người rời trận bị xử thua. Trận kết thúc được lưu vào bảng `caro_match` (người chơi, kết quả, toàn bộ nước đi).

## Kết quả unit test
```
PASS src/line98/line98.logic.spec.ts
  Line 98 logic
    ✓ spawnBalls: sinh đúng 3 bóng vào ô trống, màu 1..5
    ✓ clearLines: xóa hàng ngang, dọc và chéo đủ 5 bóng
    ✓ clearLines: không xóa hàng chỉ có 4 bóng
    ✓ findPath: trả về null khi bóng bị chặn
    ✓ move: di chuyển bóng tạo hàng 5 thì xóa và cộng điểm
    ✓ move: báo lỗi khi ô đích đã có bóng
    ✓ randomValidMove: gợi ý nước đi luôn hợp lệ
PASS src/caro/caro.spec.ts
  Caro logic
    ✓ thắng khi có 5 quân liên tiếp hàng ngang
    ✓ thắng khi có 5 quân liên tiếp đường chéo
    ✓ chưa thắng khi chỉ có 4 quân hoặc bị quân khác chen giữa
  CaroService
    ✓ ghép cặp 2 người, chặn đánh sai lượt, lưu lịch sử khi thắng

Tests:       11 passed, 11 total
```

## Hiệu năng (10 người chơi đồng thời)
`npm run load-test`: 10 client Line 98 (mỗi client 20 nước) + 10 client Caro (5 trận song song).
Latency = từ lúc gửi nước đi đến khi nhận phản hồi (bao gồm cả ghi DB):
```
Line 98 (10 người chơi đồng thời): 200 nước | avg 11.3ms | p95 20.6ms | max 26.7ms
Caro    (10 người chơi, 5 trận): 45 nước | avg 1.8ms | p95 6.5ms | max 7.2ms
```
Đều dưới 200ms. Hai tối ưu quan trọng: bật chế độ WAL cho SQLite (trước đó các lần ghi bị fsync tuần tự, p95 ~217ms),
và hàm gợi ý chỉ chạy một lần BFS cho mỗi bóng thay vì cho mỗi cặp (bóng, ô đích).
