import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaroMatch } from './caro-match.entity';
import { CaroController } from './caro.controller';
import { CaroGateway } from './caro.gateway';
import { CaroService } from './caro.service';

@Module({
  imports: [TypeOrmModule.forFeature([CaroMatch])],
  controllers: [CaroController],
  providers: [CaroService, CaroGateway],
})
export class CaroModule {}
