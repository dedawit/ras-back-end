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
    const existingTrasaction =
      await this.transactionRepository.getTransactionById(transactionId);
    if (existingTrasaction) {
      throw new ConflictException('Transaction identifier already exists');
    }

    const price = bid.totalPrice;
    const user = await this.userService.findById(userId);
    const email = user.email;
    const firstName = user.firstName;
    const lastName = user.lastName;

    const payment = await this.paymentService.initializeChapaPayment(
      transactionId,
      price,
      email,
      firstName,
      lastName,
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

  /**
   * Syncs service attributes with transaction entity
   */
  private syncWithTransaction(transaction: Transaction): void {
    this.id = transaction.id;
    this.bid = transaction.bid?.id ?? '';
    this.date = transaction.date;
  }
}
