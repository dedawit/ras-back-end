import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { SerializeResponse } from 'src/modules/common/serialize-response.decorator';
import { Transaction } from '../persistence/transaction.entity';
import { TransactionService } from '../usecase/transaction.service';
import { CreateTransactionDto } from '../usecase/dto/create-transaction.dto';
import { JwtAuthGuard } from 'src/modules/auth/guard/auth.guard';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  //   @SerializeResponse(Transaction)
  @Post(':buyerId/create')
  @UseGuards(JwtAuthGuard)
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @Param('buyerId') buyerId: string,
  ): Promise<Transaction> {
    return await this.transactionService.makeTransaction(
      createTransactionDto,
      buyerId,
    );
  }
}
