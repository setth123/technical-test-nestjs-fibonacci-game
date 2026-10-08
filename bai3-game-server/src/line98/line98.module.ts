import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Line98Game } from './line98-game.entity';
import { Line98Gateway } from './line98.gateway';
import { Line98Service } from './line98.service';

@Module({
  imports: [TypeOrmModule.forFeature([Line98Game])],
  providers: [Line98Service, Line98Gateway],
})
export class Line98Module {}
