import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './persistence/feedback.entity';
import { FeedbackRepository } from './persistence/feedback.repository';
import { FeedbackService } from './usecase/feedback.service';
import { TransactionModule } from 'src/modules/transaction/transaction.module';
import { UserModule } from 'src/modules/user/user.module';
import { FeedbackController } from './controller/feedback.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feedback]),
    TransactionModule,
    UserModule,
  ],
  providers: [FeedbackService, FeedbackRepository],
  controllers: [FeedbackController],
})
export class FeedbackModule {}
