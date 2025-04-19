import { forwardRef, Module } from '@nestjs/common';
import { TransactionService } from './usecase/transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './persistence/transaction.entity';
import { TransactionRepository } from './persistence/transaction.repository';
import { BidModule } from '../bid/bid.module';
import { PaymentModule } from '../payment/payment.module';
import { UserModule } from '../user/user.module';
import { TransactionController } from './controller/transaction.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    BidModule,
    forwardRef(() => PaymentModule),
    UserModule,
  ],
  providers: [TransactionService, TransactionRepository],
  exports: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
