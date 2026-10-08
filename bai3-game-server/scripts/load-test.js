/**
 * Load test: 10 người chơi đồng thời (chạy khi server đang bật: npm start).
 *  - 10 client Line 98, mỗi client đi 20 nước (dùng "hint" để có nước hợp lệ)
 *  - 10 client Caro (5 cặp), mỗi cặp đánh cho đến khi có người thắng
 * Đo latency = thời gian từ lúc gửi nước đi đến khi nhận phản hồi từ server.
 */
const { io } = require('socket.io-client');

const URL = process.env.URL || 'http://localhost:3002';
const PLAYERS = 10;
const once = (socket, event) => new Promise((ok) => socket.once(event, ok));
/** Chờ sự kiện thỏa điều kiện (bỏ qua các sự kiện cũ cùng tên) */
const waitFor = (socket, event, match) => new Promise((ok) => {
  const handler = (data) => match(data) && (socket.off(event, handler), ok(data));
  socket.on(event, handler);
});

async function getToken(username) {
  const post = (path) => fetch(URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'secret123' }),
  });
  await post('/auth/register'); // bỏ qua lỗi nếu user đã tồn tại
  return (await (await post('/auth/login')).json()).accessToken;
}

async function line98Player(token, latencies) {
  const socket = io(URL + '/line98', { auth: { token } });
  socket.emit('start', { newGame: true });
  await once(socket, 'state');
  for (let i = 0; i < 20; i++) {
    socket.emit('hint');
    const hint = await once(socket, 'hint');
    if (!hint) break;
    const start = performance.now();
    socket.emit('move', hint);
    const state = await once(socket, 'state');
    latencies.push(performance.now() - start);
    if (state.gameOver) break;
  }
  socket.disconnect();
}

/** Ghép cặp 2 người (gọi tuần tự để các cặp không bị ghép chéo nhau) */
async function caroMatch(tokenA, tokenB) {
  const sockets = [io(URL + '/caro', { auth: { token: tokenA } }), io(URL + '/caro', { auth: { token: tokenB } })];
  const starts = sockets.map((s) => once(s, 'match_start'));
  sockets[0].emit('find_match');
  await once(sockets[0], 'waiting');
  sockets[1].emit('find_match');
  const [a] = await Promise.all(starts);
  return a.symbol === 'X' ? sockets : [sockets[1], sockets[0]];
}

/** X đánh hàng 0, O đánh hàng 1 => X thắng sau 5 nước */
async function caroPlay([x, o], latencies) {
  const over = once(x, 'game_over');
  for (let c = 0; c < 5; c++) {
    for (const [socket, r] of [[x, 0], [o, 1]]) {
      if (socket === o && c === 4) break;
      const start = performance.now();
      const moved = waitFor(socket, 'moved', (m) => m.r === r && m.c === c);
      socket.emit('move', { r, c });
      await moved;
      latencies.push(performance.now() - start);
    }
  }
  const result = await over;
  x.disconnect();
  o.disconnect();
  return result.result;
}

function report(name, latencies) {
  const sorted = [...latencies].sort((a, b) => a - b);
  const avg = sorted.reduce((s, v) => s + v, 0) / sorted.length;
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  console.log(`${name}: ${sorted.length} nước | avg ${avg.toFixed(1)}ms | p95 ${p95.toFixed(1)}ms | max ${sorted.at(-1).toFixed(1)}ms`);
}

(async () => {
  const tokens = await Promise.all(Array.from({ length: PLAYERS }, (_, i) => getToken(`loadtest${i}`)));

  const line98 = [];
  await Promise.all(tokens.map((t) => line98Player(t, line98)));
  report(`Line 98 (${PLAYERS} người chơi đồng thời)`, line98);

  const caro = [];
  const pairs = [];
  for (let i = 0; i < PLAYERS; i += 2) pairs.push(await caroMatch(tokens[i], tokens[i + 1]));
  const results = await Promise.all(pairs.map((pair) => caroPlay(pair, caro))); // 5 trận song song
  report(`Caro    (${PLAYERS} người chơi, ${pairs.length} trận)`, caro);
  console.log('Kết quả các trận Caro:', results.join(', '));
  process.exit(0);
})();
