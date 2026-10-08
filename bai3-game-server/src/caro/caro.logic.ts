/** Logic thuần của Cờ Caro 15x15 */
export const SIZE = 15;
export const WIN_LENGTH = 5;

export type Symbol = 'X' | 'O';
export type Board = (Symbol | null)[][];

export function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

/** Kiểm tra nước vừa đánh tại (r, c) có tạo hàng >= 5 ký hiệu liên tiếp không */
export function isWinningMove(board: Board, r: number, c: number): boolean {
  const symbol = board[r][c];
  if (!symbol) return false;
  const count = (dr: number, dc: number) => {
    let n = 0;
    for (let i = r + dr, j = c + dc; board[i]?.[j] === symbol; i += dr, j += dc) n++;
    return n;
  };
  return [[0, 1], [1, 0], [1, 1], [1, -1]].some(
    ([dr, dc]) => 1 + count(dr, dc) + count(-dr, -dc) >= WIN_LENGTH,
  );
}

export function isBoardFull(board: Board): boolean {
  return board.every((row) => row.every(Boolean));
}
