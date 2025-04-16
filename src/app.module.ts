import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AppDataSource } from 'config/data-source';
import { UserModule } from './modules/user/user.module';

import { RFQModule } from './modules/rfq/rfq.module';

import { AuthModule } from './modules/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { BidModule } from './modules/bid/bid.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    UserModule,
    RFQModule,
    AuthModule,
    MulterModule.register({
      dest: './secured-storage', // Directory to store uploaded files
    }),
    BidModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
