import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { WishesModule } from '../wishes/wishes.module';
import { WishlistsModule } from '../wishlists/wishlists.module';
import { OffersModule } from '../offers/offers.module';
import { HashModule } from '../hash/hash.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from 'src/configs/database.config';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from 'src/configs/logger.config';
import { config } from 'src/configs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),
    WinstonModule.forRoot(loggerConfig),
    UsersModule,
    WishesModule,
    WishlistsModule,
    OffersModule,
    AuthModule,
    HashModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
