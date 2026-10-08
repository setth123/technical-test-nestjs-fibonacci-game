import { CaroService } from './caro.service';
import { emptyBoard, isWinningMove } from './caro.logic';

describe('Caro logic', () => {
  it('thắng khi có 5 quân liên tiếp hàng ngang', () => {
    const board = emptyBoard();
    for (let c = 3; c < 8; c++) board[7][c] = 'X';
    expect(isWinningMove(board, 7, 5)).toBe(true);
  });

  it('thắng khi có 5 quân liên tiếp đường chéo', () => {
    const board = emptyBoard();
    for (let i = 0; i < 5; i++) board[10 - i][i] = 'O';
    expect(isWinningMove(board, 8, 2)).toBe(true);
  });

  it('chưa thắng khi chỉ có 4 quân hoặc bị quân khác chen giữa', () => {
    const board = emptyBoard();
    for (let c = 0; c < 4; c++) board[0][c] = 'X';
    board[0][4] = 'O';
    board[0][5] = 'X';
    expect(isWinningMove(board, 0, 3)).toBe(false);
  });
});

describe('CaroService', () => {
  const repo = { create: jest.fn((x) => x), save: jest.fn(), find: jest.fn() };
  const service = new CaroService(repo as any);
  const p1 = { socketId: 's1', userId: 1, username: 'alice' };
  const p2 = { socketId: 's2', userId: 2, username: 'bob' };

  it('ghép cặp 2 người, chặn đánh sai lượt, lưu lịch sử khi thắng', async () => {
    expect(service.joinQueue(p1)).toBeNull(); // người đầu tiên phải chờ
    const room = service.joinQueue(p2)!;
    expect(room).toBeTruthy();

    const x = room.players.X.socketId;
    const o = room.players.O.socketId;
    await expect(service.play(o, 0, 0)).rejects.toThrow('Chưa đến lượt');

    let last;
    for (let c = 0; c < 5; c++) {
      last = await service.play(x, 0, c);
      if (c < 4) await service.play(o, 1, c);
    }
    expect(last!.result).toBe('X');
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ result: 'X' }));
    expect(service.getRoomOf(x)).toBeUndefined(); // phòng đã đóng
  });
});
