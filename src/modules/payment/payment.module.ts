import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './usecase/payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './persistence/payment.entity';
import { TransactionModule } from '../transaction/transaction.module';
import { PaymentRepository } from './persistence/payment.repository';
import { PaymentController } from './controller/payment.controller';
import { BidService } from '../bid/usecase/bid.service';
import { BidRepository } from '../bid/persistence/bid.repository';
import { BidModule } from '../bid/bid.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    forwardRef(() => TransactionModule),
    BidModule,
  ],
  providers: [PaymentService, PaymentRepository],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
