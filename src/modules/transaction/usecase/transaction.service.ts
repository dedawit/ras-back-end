import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '../persistence/transaction.entity'; // Adjust the path
import { BidService } from 'src/modules/bid/usecase/bid.service';
import { TransactionRepository } from '../persistence/transaction.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PaymentService } from 'src/modules/payment/usecase/payment.service';
import { UserService } from 'src/modules/user/usecase/user.service';

@Injectable()
export class TransactionService {
  private id: string;
  private bid: string;
  private date: Date;

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly bidService: BidService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
  ) {}

  /**
   * Creates a new transaction
   */
  public async makeTransaction(
    createTransactionDto: CreateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    const { bidId, transactionId } = createTransactionDto;
    const bid = await this.bidService.getBid(bidId);
    if (!bid) {
      throw new NotFoundException(`Bid with ID ${bidId} not found`);
    }
    // Check if the bid already has any transactions
    // if (bid.transactions && bid.transactions.length > 0) {
    //   throw new ConflictException('A transaction already exists for this bid');
    // }
    const existingTrasaction = await this.getTransactionByIdAndUser(
      transactionId,
      userId,
    );
    console.log(existingTrasaction, 'existingTrasaction');
    if (existingTrasaction) {
      throw new ConflictException('Transaction identifier already exists');
    }

    const price = bid.totalPrice;
    const user = await this.userService.findById(userId);
    const email = user.email;
    const firstName = user.firstName;
    const lastName = user.lastName;
    const phoneNumber = user.telephone; // Optional, as it’s not always required

    const payment = await this.paymentService.initializeChapaPayment(
      transactionId,
      price,
      email,
      firstName,
      lastName,
      bidId,
      phoneNumber,
    );
    const transaction = await this.transactionRepository.makeTransaction(
      transactionId,
      bid.id,
    );
    await this.addPayment(transaction.id, payment.paymentId);
    this.syncWithTransaction(transaction);
    return payment;
  }

  // a method to add payment to trasaction
  async addPayment(id: string, paymentId: string) {
    return this.transactionRepository.addPayment(id, paymentId);
  }

  // a method to get transaction by id
  async getTransactionById(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.getTransactionById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }
  // a method to get transaction by db id
  async getTrasactionByDbId(id: string): Promise<Transaction> {
    const transaction =
      await this.transactionRepository.getTrasactionByDbId(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  // a method to get transaction by id
  async getTransactionByIdAndUser(
    id: string,
    userId: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.getTransactionByUserId(
      id,
      userId,
    );

    return transaction;
  }

  // Get all transactions for a Buyer
  async getAllTransactionsByBuyerId(buyerId: string): Promise<Transaction[]> {
    const transactions =
      await this.transactionRepository.getAllTransactionsByBuyerId(buyerId);
    if (!transactions || transactions.length === 0) {
      throw new NotFoundException(
        `No transactions found for Buyer ID ${buyerId}`,
      );
    }
    return transactions;
  }

  // Get all transactions for a Seller
  async getAllTransactionsBySellerId(sellerId: string): Promise<Transaction[]> {
    const transactions =
      await this.transactionRepository.getAllTransactionsBySellerId(sellerId);
    if (!transactions || transactions.length === 0) {
      throw new NotFoundException(
        `No transactions found for Seller ID ${sellerId}`,
      );
    }
    return transactions;
  }

  async generateTransactionId(buyerId: string): Promise<string> {
    return this.transactionRepository.generateNextTransactionIdForBuyer(
      buyerId,
    );
  }

  /**
   * Syncs service attributes with transaction entity
   */
  private syncWithTransaction(transaction: Transaction): void {
    this.id = transaction.id;
    this.bid = transaction.bid?.id ?? '';
    this.date = transaction.date;
  }
}
