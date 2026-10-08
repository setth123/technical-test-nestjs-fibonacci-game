/**
 * Tính số Fibonacci thứ n bằng Dynamic Programming (bottom-up, mảng).
 * Dùng BigInt để không bị tràn số (F(79) trở đi vượt Number.MAX_SAFE_INTEGER).
 *
 * Quy ước: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)
 * Độ phức tạp: thời gian O(n), không gian O(n) (mảng dp).
 */
function fibonacci(n) {
  if (!Number.isInteger(n) || n < 0) throw new Error('n phải là số nguyên không âm');
  const dp = [0n, 1n]; // bảng lưu kết quả các bài toán con
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

module.exports = { fibonacci };

// Chạy trực tiếp: node fibonacci.js
if (require.main === module) {
  // 1. Kiểm tra tính đúng đắn với các giá trị đã biết
  const expected = { 10: 55n, 20: 6765n, 50: 12586269025n };
  for (const [n, value] of Object.entries(expected)) {
    const result = fibonacci(Number(n));
    console.log(`F(${n}) = ${result} ${result === value ? '✔' : '✘ (mong đợi ' + value + ')'}`);
  }

  // 2. Đo thời gian 10 lần chạy F(50) bằng console.time/timeEnd
  const RUNS = 10;
  let total = 0;
  for (let i = 1; i <= RUNS; i++) {
    console.time(`Lần ${i}`);
    const start = process.hrtime.bigint();
    fibonacci(50);
    total += Number(process.hrtime.bigint() - start) / 1e6;
    console.timeEnd(`Lần ${i}`);
  }
  console.log(`Thời gian trung bình qua ${RUNS} lần: ${(total / RUNS).toFixed(4)} ms`);
}
