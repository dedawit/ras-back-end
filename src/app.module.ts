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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
