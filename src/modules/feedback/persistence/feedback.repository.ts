import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto } from '../usecase/dto/create-feedback.dto';
import { User } from 'src/modules/user/persistence/user.entity';

@Injectable()
export class FeedbackRepository {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  async createFeedback(
    createFeedbackDto: CreateFeedbackDto,
    user: User,
  ): Promise<Feedback> {
    const { transactionId, comment, star } = createFeedbackDto;
    const feedback = this.feedbackRepository.create({
      transactionId,
      comment,
      star,
      transaction: { id: transactionId },
      createdBy: user,
    });
    return this.feedbackRepository.save(feedback);
  }

  async getFeedbacksByTransactionId(
    transactionId: string,
  ): Promise<Feedback[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { transactionId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
    // if (!feedbacks || feedbacks.length === 0) {
    //   throw new NotFoundException(
    //     `No feedback found for transaction ID ${transactionId}`,
    //   );
    // }
    return feedbacks;
  }
}
