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
import { PaymentModule } from './modules/payment/payment.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { ProductModule } from './modules/product/product.module';
import { ServeStaticModule } from '@nestjs/serve-static'; // <== You forgot to import this
import { join } from 'path';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'src', 'secured-storage'),
      serveRoot: '/secured-storage',
    }),
    MulterModule.register({
      dest: './secured-storage',
    }),
    UserModule,
    RFQModule,
    AuthModule,
    BidModule,
    TransactionModule,
    PaymentModule,
    FeedbackModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
