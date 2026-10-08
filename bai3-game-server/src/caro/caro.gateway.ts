import {
  ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect,
  SubscribeMessage, WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { CaroService } from './caro.service';

/**
 * Client -> server: "find_match", "move" {r, c}
 * Server -> client: "waiting", "match_start" {symbol, opponent}, "moved" {r, c, symbol, turn},
 *                   "game_over" {result, reason}, "error_message"
 */
@WebSocketGateway({ namespace: 'caro' })
export class CaroGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Namespace;

  constructor(
    private readonly authService: AuthService,
    private readonly caroService: CaroService,
  ) {}

  handleConnection(client: Socket) {
    const user = this.authService.verifyToken(client.handshake.auth?.token);
    if (!user) return client.disconnect();
    client.data.user = user;
  }

  async handleDisconnect(client: Socket) {
    const left = await this.caroService.leave(client.id);
    if (left) this.server.to(left.room.id).emit('game_over', { result: left.winner, reason: 'Đối thủ đã rời trận' });
  }

  @SubscribeMessage('find_match')
  findMatch(@ConnectedSocket() client: Socket) {
    const { sub, username } = client.data.user;
    const room = this.caroService.joinQueue({ socketId: client.id, userId: sub, username });
    if (!room) return client.emit('waiting');

    for (const symbol of ['X', 'O'] as const) {
      const me = room.players[symbol];
      const opponent = room.players[symbol === 'X' ? 'O' : 'X'];
      const socket = this.server.sockets.get(me.socketId);
      socket?.join(room.id);
      socket?.emit('match_start', { symbol, opponent: opponent.username });
    }
  }

  @SubscribeMessage('move')
  async move(@ConnectedSocket() client: Socket, @MessageBody() body: { r: number; c: number }) {
    try {
      const { room, symbol, result } = await this.caroService.play(client.id, body.r, body.c);
      this.server.to(room.id).emit('moved', { r: body.r, c: body.c, symbol, turn: room.turn });
      if (result) {
        this.server.to(room.id).emit('game_over', { result, reason: result === 'draw' ? 'Hòa' : `${result} có 5 quân liên tiếp` });
        this.server.in(room.id).socketsLeave(room.id);
      }
    } catch (e) {
      client.emit('error_message', (e as Error).message);
    }
  }
}
