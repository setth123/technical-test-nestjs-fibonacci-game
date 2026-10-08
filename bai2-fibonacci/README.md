# Bài 2: Tính số Fibonacci thứ 50

## Chạy
```bash
node fibonacci.js
```

## Thuật toán
Dynamic Programming dạng bottom-up với mảng `dp`:
- `dp[0] = 0n`, `dp[1] = 1n`
- `dp[i] = dp[i-1] + dp[i-2]` với `i = 2..n`

Mỗi bài toán con chỉ được tính **một lần** (khác với đệ quy thuần, vốn tính lặp lại và tốn O(2^n)).
Dùng `BigInt` (hậu tố `n`) để kết quả luôn chính xác với n lớn (từ F(79) đã vượt `Number.MAX_SAFE_INTEGER`).

## Độ phức tạp
| | Độ phức tạp | Giải thích |
|---|---|---|
| Thời gian | **O(n)** | Một vòng lặp từ 2 đến n, mỗi bước một phép cộng |
| Không gian | **O(n)** | Mảng `dp` lưu n+1 phần tử |

> Có thể giảm không gian xuống **O(1)** bằng cách chỉ giữ 2 biến `prev`, `curr` thay vì cả mảng.

## Kết quả kiểm tra
| n | Kết quả | Đúng |
|---|---|---|
| 10 | 55 | ✔ |
| 20 | 6765 | ✔ |
| 50 | 12586269025 | ✔ |

## Thời gian thực thi F(50) (10 lần, Node v20)
```
Lần 1: 0.146ms
Lần 2: 0.012ms
Lần 3: 0.01ms
Lần 4: 0.01ms
Lần 5: 0.023ms
Lần 6: 0.01ms
Lần 7: 0.012ms
Lần 8: 0.01ms
Lần 9: 0.009ms
Lần 10: 0.024ms
Thời gian trung bình qua 10 lần: 0.0062 ms
```
Trung bình **≈ 0.006 ms**, thấp hơn nhiều so với yêu cầu 1ms. Lần chạy đầu chậm hơn do JIT warm-up của V8.
(Số liệu `console.time` bao gồm cả chi phí in log; giá trị trung bình được đo riêng bằng `process.hrtime` để chính xác hơn.)
