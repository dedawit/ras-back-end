import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Payment } from 'src/modules/payment/persistence/payment.entity';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async makeTransaction(transactionId: string, bidId: string) {
    const transaction = this.transactionRepository.create({
      transactionId,
      bid: { id: bidId },
    });
    return this.transactionRepository.save(transaction);
  }

  async addPayment(id: string, paymentId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id,
      },
    });
    console.log('id', id, 'transaction', transaction);
    transaction.payment = { id: paymentId } as Payment;

    return this.transactionRepository.save(transaction);
  }

  async getTransactionById(transactionId: string) {
    return this.transactionRepository.findOne({
      where: {
        transactionId,
      },
    });
  }
}
