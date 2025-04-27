import { Injectable, NotFoundException } from '@nestjs/common';
import { FeedbackRepository } from '../persistence/feedback.repository';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Feedback } from '../persistence/feedback.entity';
import { TransactionService } from 'src/modules/transaction/usecase/transaction.service';
import { UserService } from 'src/modules/user/usecase/user.service';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
  ) {}

  async createFeedback(
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<Feedback> {
    // Verify transaction exists
    const transaction = await this.transactionService.getTrasactionByDbId(
      createFeedbackDto.transactionId,
    );
    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${createFeedbackDto.transactionId} not found`,
      );
    }

    // Verify user exists
    const user = await this.userService.findById(createFeedbackDto.createdBy);
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createFeedbackDto.createdBy} not found`,
      );
    }

    return this.feedbackRepository.createFeedback(createFeedbackDto, user);
  }

  async getFeedbacksByTransactionId(
    transactionId: string,
  ): Promise<Feedback[]> {
    // Verify transaction exists
    const transaction =
      await this.transactionService.getTrasactionByDbId(transactionId);
    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    return this.feedbackRepository.getFeedbacksByTransactionId(transactionId);
  }
}
