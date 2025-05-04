import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
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
      relations: ['bid', 'bid.rfq', 'payment'],
    });
  }

  // get transaction by db Id
  async getTrasactionByDbId(id: string) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id: id,
      },
      relations: ['bid', 'bid.rfq', 'bid.rfq.createdBy', 'bid.createdBy'],
    });
    console.log('transaction found', transaction);
    return transaction;
  }

  // get all transactions
  async getTransactionByUserId(transactionId: string, userId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
      relations: ['bid', 'bid.rfq', 'bid.rfq.createdBy'],
    });
    console.log('transaction found', transactionId);
    if (!transaction) {
      return null;
    }
    console.log(transaction.bid.rfq.createdBy.id, 'my id');

    // Check if the RFQ was created by this user
    if (transaction.bid.rfq.createdBy.id !== userId) {
      return null;
    }

    return transaction;
  }
  // Get all transactions for a Buyer
  async getAllTransactionsByBuyerId(buyerId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: {
        bid: {
          rfq: {
            createdBy: {
              id: buyerId,
            },
          },
        },
      },
      relations: ['bid.createdBy', 'bid.rfq.createdBy', 'payment'],
    });
  }

  // Get all transactions for a Seller
  async getAllTransactionsBySellerId(sellerId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: {
        bid: {
          createdBy: {
            id: sellerId,
          },
        },
      },
      relations: ['bid.createdBy', 'bid.rfq.createdBy', 'payment'],
    });
  }

  async generateNextTransactionIdForBuyer(buyerId: string): Promise<string> {
    const latestTransaction = await this.transactionRepository.findOne({
      where: {
        transactionId: Raw((alias) => `${alias} ~ '^TR-[0-9]+$'`),
        bid: {
          rfq: {
            createdBy: { id: buyerId },
          },
        },
      },
      order: { transactionId: 'DESC' },
      relations: ['bid', 'bid.rfq', 'bid.rfq.createdBy'],
    });

    let nextNumber = 1;
    if (latestTransaction && latestTransaction.transactionId) {
      const match = latestTransaction.transactionId.match(/^TR-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `TR-${nextNumber.toString().padStart(3, '0')}`;
  }
}
