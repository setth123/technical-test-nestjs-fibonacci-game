/**
 * Logic thuần của Line 98 (không phụ thuộc NestJS/DB => dễ unit test).
 * Bàn chơi là mảng 9x9: 0 = ô trống, 1..5 = màu bóng.
 */
export const SIZE = 9;
export const COLORS = 5;
export const BALLS_PER_TURN = 3;
export const LINE_LENGTH = 5;

export type Board = number[][];
export type Cell = { r: number; c: number };

export interface MoveResult {
  path: Cell[]; // đường đi của bóng (để client vẽ hiệu ứng di chuyển)
  cleared: number; // số bóng bị xóa trong lượt
  spawned: Cell[]; // vị trí 3 bóng mới
  gameOver: boolean;
}

const NEIGHBORS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const LINE_DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]]; // ngang, dọc, 2 đường chéo

const inside = (r: number, c: number) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

export function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

export function emptyCells(board: Board): Cell[] {
  const cells: Cell[] = [];
  board.forEach((row, r) => row.forEach((v, c) => v === 0 && cells.push({ r, c })));
  return cells;
}

/** Đặt ngẫu nhiên `count` bóng vào các ô trống */
export function spawnBalls(board: Board, count: number, random = Math.random): Cell[] {
  const free = emptyCells(board);
  const spawned: Cell[] = [];
  for (let i = 0; i < count && free.length > 0; i++) {
    const [cell] = free.splice(Math.floor(random() * free.length), 1);
    board[cell.r][cell.c] = 1 + Math.floor(random() * COLORS);
    spawned.push(cell);
  }
  return spawned;
}

export function newGame(random = Math.random): Board {
  const board = emptyBoard();
  spawnBalls(board, 5, random);
  return board;
}

/** BFS tìm đường ngắn nhất qua các ô trống (đi 4 hướng). Trả về null nếu không có đường. */
export function findPath(board: Board, from: Cell, to: Cell): Cell[] | null {
  const prev = new Map<string, Cell | null>([[`${from.r},${from.c}`, null]]);
  const queue: Cell[] = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.r === to.r && cur.c === to.c) {
      const path: Cell[] = [];
      for (let p: Cell | null = cur; p; p = prev.get(`${p.r},${p.c}`)!) path.unshift(p);
      return path;
    }
    for (const [dr, dc] of NEIGHBORS) {
      const next = { r: cur.r + dr, c: cur.c + dc };
      const key = `${next.r},${next.c}`;
      if (inside(next.r, next.c) && board[next.r][next.c] === 0 && !prev.has(key)) {
        prev.set(key, cur);
        queue.push(next);
      }
    }
  }
  return null;
}

/** Tìm và xóa mọi hàng >= 5 bóng cùng màu. Trả về số bóng đã xóa. */
export function clearLines(board: Board): number {
  const toClear = new Set<string>();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const color = board[r][c];
      if (!color) continue;
      for (const [dr, dc] of LINE_DIRECTIONS) {
        // chỉ bắt đầu đếm từ đầu đoạn để tránh đếm trùng
        if (inside(r - dr, c - dc) && board[r - dr][c - dc] === color) continue;
        const line: string[] = [];
        for (let i = r, j = c; inside(i, j) && board[i][j] === color; i += dr, j += dc) line.push(`${i},${j}`);
        if (line.length >= LINE_LENGTH) line.forEach((k) => toClear.add(k));
      }
    }
  }
  toClear.forEach((k) => {
    const [r, c] = k.split(',').map(Number);
    board[r][c] = 0;
  });
  return toClear.size;
}

/** Thực hiện một lượt: di chuyển bóng -> xóa hàng -> sinh 3 bóng mới -> xóa hàng (nếu bóng mới tạo hàng). */
export function move(board: Board, from: Cell, to: Cell, random = Math.random): MoveResult {
  if (!inside(from.r, from.c) || !inside(to.r, to.c)) throw new Error('Ô không hợp lệ');
  if (!board[from.r][from.c]) throw new Error('Ô xuất phát không có bóng');
  if (board[to.r][to.c]) throw new Error('Ô đích đã có bóng');
  const path = findPath(board, from, to);
  if (!path) throw new Error('Không có đường đi');

  board[to.r][to.c] = board[from.r][from.c];
  board[from.r][from.c] = 0;

  let cleared = clearLines(board);
  const spawned = spawnBalls(board, BALLS_PER_TURN, random);
  cleared += clearLines(board);

  return { path, cleared, spawned, gameOver: emptyCells(board).length === 0 };
}

/** Các ô trống mà bóng tại `from` có thể đi tới (BFS loang) */
export function reachableCells(board: Board, from: Cell): Cell[] {
  const seen = new Set([`${from.r},${from.c}`]);
  const queue: Cell[] = [from];
  const result: Cell[] = [];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const [dr, dc] of NEIGHBORS) {
      const next = { r: cur.r + dr, c: cur.c + dc };
      const key = `${next.r},${next.c}`;
      if (inside(next.r, next.c) && board[next.r][next.c] === 0 && !seen.has(key)) {
        seen.add(key);
        queue.push(next);
        result.push(next);
      }
    }
  }
  return result;
}

/** Trợ giúp: chọn ngẫu nhiên một nước đi hợp lệ (bóng có đường tới một ô trống). */
export function randomValidMove(board: Board, random = Math.random): { from: Cell; to: Cell } | null {
  const pick = <T>(arr: T[]) => arr.splice(Math.floor(random() * arr.length), 1)[0];
  const balls: Cell[] = [];
  board.forEach((row, r) => row.forEach((v, c) => v && balls.push({ r, c })));
  while (balls.length) {
    const from = pick(balls); // thử lần lượt các bóng theo thứ tự ngẫu nhiên
    const targets = reachableCells(board, from);
    if (targets.length) return { from, to: pick(targets) };
  }
  return null;
}
