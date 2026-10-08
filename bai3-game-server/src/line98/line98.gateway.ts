import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { Cell } from './line98.logic';
import { Line98Service } from './line98.service';

/**
 * Client -> server: "start" {newGame?}, "move" {from, to}, "hint"
 * Server -> client: "state" {board, score, gameOver, lastMove?}, "hint" {from, to}, "error_message" message
 */
@WebSocketGateway({ namespace: 'line98' })
export class Line98Gateway implements OnGatewayConnection {
  constructor(
    private readonly authService: AuthService,
    private readonly line98Service: Line98Service,
  ) {}

  handleConnection(client: Socket) {
    const user = this.authService.verifyToken(client.handshake.auth?.token);
    if (!user) return client.disconnect();
    client.data.userId = user.sub;
  }

  @SubscribeMessage('start')
  async start(@ConnectedSocket() client: Socket, @MessageBody() body?: { newGame?: boolean }) {
    const game = await this.line98Service.start(client.data.userId, body?.newGame);
    client.emit('state', { board: game.board, score: game.score, gameOver: game.gameOver });
  }

  @SubscribeMessage('move')
  async move(@ConnectedSocket() client: Socket, @MessageBody() body: { from: Cell; to: Cell }) {
    try {
      const { game, result } = await this.line98Service.move(client.data.userId, body.from, body.to);
      client.emit('state', { board: game.board, score: game.score, gameOver: game.gameOver, lastMove: result });
    } catch (e) {
      client.emit('error_message', (e as Error).message);
    }
  }

  @SubscribeMessage('hint')
  async hint(@ConnectedSocket() client: Socket) {
    try {
      client.emit('hint', await this.line98Service.hint(client.data.userId));
    } catch (e) {
      client.emit('error_message', (e as Error).message);
    }
  }
}
