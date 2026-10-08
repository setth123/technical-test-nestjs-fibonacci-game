import { clearLines, emptyBoard, findPath, move, randomValidMove, spawnBalls } from './line98.logic';

describe('Line 98 logic', () => {
  it('spawnBalls: sinh đúng 3 bóng vào ô trống, màu 1..5', () => {
    const board = emptyBoard();
    const spawned = spawnBalls(board, 3);
    expect(spawned).toHaveLength(3);
    spawned.forEach(({ r, c }) => expect(board[r][c]).toBeGreaterThanOrEqual(1));
    spawned.forEach(({ r, c }) => expect(board[r][c]).toBeLessThanOrEqual(5));
  });

  it('clearLines: xóa hàng ngang, dọc và chéo đủ 5 bóng', () => {
    const board = emptyBoard();
    for (let i = 0; i < 5; i++) {
      board[0][i] = 1; // ngang
      board[i + 2][8] = 2; // dọc
      board[i + 3][i] = 3; // chéo
    }
    board[8][0] = 4; // bóng lẻ, không bị xóa
    expect(clearLines(board)).toBe(15);
    expect(board[8][0]).toBe(4);
  });

  it('clearLines: không xóa hàng chỉ có 4 bóng', () => {
    const board = emptyBoard();
    for (let i = 0; i < 4; i++) board[0][i] = 1;
    expect(clearLines(board)).toBe(0);
  });

  it('findPath: trả về null khi bóng bị chặn', () => {
    const board = emptyBoard();
    board[0][0] = 1;
    board[0][1] = 2;
    board[1][0] = 2;
    expect(findPath(board, { r: 0, c: 0 }, { r: 5, c: 5 })).toBeNull();
  });

  it('move: di chuyển bóng tạo hàng 5 thì xóa và cộng điểm', () => {
    const board = emptyBoard();
    for (let i = 0; i < 4; i++) board[4][i] = 1;
    board[8][8] = 1;
    // random cố định 0.99 => bóng mới sinh ở các ô cuối, không ảnh hưởng hàng 4
    const result = move(board, { r: 8, c: 8 }, { r: 4, c: 4 }, () => 0.99);
    expect(result.cleared).toBe(5);
    expect(result.path[result.path.length - 1]).toEqual({ r: 4, c: 4 });
    expect(board[4].slice(0, 5)).toEqual([0, 0, 0, 0, 0]);
  });

  it('move: báo lỗi khi ô đích đã có bóng', () => {
    const board = emptyBoard();
    board[0][0] = 1;
    board[0][1] = 2;
    expect(() => move(board, { r: 0, c: 0 }, { r: 0, c: 1 })).toThrow('Ô đích đã có bóng');
  });

  it('randomValidMove: gợi ý nước đi luôn hợp lệ', () => {
    const board = emptyBoard();
    spawnBalls(board, 20);
    const hint = randomValidMove(board)!;
    expect(board[hint.from.r][hint.from.c]).toBeGreaterThan(0);
    expect(findPath(board, hint.from, hint.to)).not.toBeNull();
  });
});
