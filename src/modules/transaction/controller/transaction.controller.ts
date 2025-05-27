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
import { RoleGuard } from 'src/modules/common/guards/role.guard';
import { Roles } from 'src/modules/common/roles.decorator';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  //   @SerializeResponse(Transaction)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('buyer')
  @Post(':buyerId/create')
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
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('buyer')
  @Get('buyer/:buyerId')
  // @SerializeResponse(Transaction)
  async getAllTransactionsByBuyerId(
    @Param('buyerId') buyerId: string,
  ): Promise<Transaction[]> {
    return await this.transactionService.getAllTransactionsByBuyerId(buyerId);
  }

  // Get all transactions for a Seller
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller')
  @Get('seller/:sellerId')
  @UseGuards(JwtAuthGuard)
  // @SerializeResponse(Transaction)
  async getAllTransactionsBySellerId(
    @Param('sellerId') sellerId: string,
  ): Promise<Transaction[]> {
    return await this.transactionService.getAllTransactionsBySellerId(sellerId);
  }


  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller')
  @Get('seller/:sellerId')
  async getSellerTransactions(
    @Param('sellerId') sellerId: string,
  ): Promise<any[]> {
    return this.transactionService.getTransactionsBySeller(sellerId);
  }


  // ✅ Get transaction by database ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getTransactionByDbId(@Param('id') id: string): Promise<Transaction> {
    const transaction = await this.transactionService.getTrasactionByDbId(id);

    return transaction;
  }

  // ✅ Generate a new transaction ID for a specific buyer
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('buyer')
  @Get(':buyerId/generate-id')
  async generateTransactionId(
    @Param('buyerId') buyerId: string,
  ): Promise<{ transactionId: string }> {
    const transactionId =
      await this.transactionService.generateTransactionId(buyerId);
    return { transactionId };
  }
}
