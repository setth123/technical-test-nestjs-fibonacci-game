import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CaroModule } from './caro/caro.module';
import { Line98Module } from './line98/line98.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'game.sqlite',
      autoLoadEntities: true,
      synchronize: true,
      enableWAL: true, // WAL giúp ghi nhanh hơn khi nhiều người chơi cùng lúc
      prepareDatabase: (db) => db.pragma('synchronous = NORMAL'),
    }),
    AuthModule,
    UsersModule,
    Line98Module,
    CaroModule,
  ],
})
export class AppModule {}
