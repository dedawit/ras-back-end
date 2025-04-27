import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  Param,
  Get,
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
  // Get all transactions for a Buyer
  @Get('buyer/:buyerId')
  @UseGuards(JwtAuthGuard)
  // @SerializeResponse(Transaction)
  async getAllTransactionsByBuyerId(
    @Param('buyerId') buyerId: string,
  ): Promise<Transaction[]> {
    return await this.transactionService.getAllTransactionsByBuyerId(buyerId);
  }

  // Get all transactions for a Seller
  @Get('seller/:sellerId')
  @UseGuards(JwtAuthGuard)
  // @SerializeResponse(Transaction)
  async getAllTransactionsBySellerId(
    @Param('sellerId') sellerId: string,
  ): Promise<Transaction[]> {
    return await this.transactionService.getAllTransactionsBySellerId(sellerId);
  }

  // ✅ Get transaction by database ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getTransactionByDbId(@Param('id') id: string): Promise<Transaction> {
    const transaction = await this.transactionService.getTrasactionByDbId(id);

    return transaction;
  }
}
