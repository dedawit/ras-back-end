import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FeedbackService } from '../usecase/feedback.service';
import { CreateFeedbackDto } from '../usecase/dto/create-feedback.dto';
import { Feedback } from '../persistence/feedback.entity';
import { JwtAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { User } from 'src/modules/user/persistence/user.entity';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<Feedback> {
    return this.feedbackService.createFeedback(createFeedbackDto);
  }

  @Get('transaction/:transactionId')
  @UseGuards(JwtAuthGuard)
  async getFeedbacksByTransactionId(
    @Param('transactionId') transactionId: string,
  ): Promise<Feedback[]> {
    return this.feedbackService.getFeedbacksByTransactionId(transactionId);
  }
}
