import {
  Injectable,
  HttpException,
  HttpStatus,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { TransactionService } from 'src/modules/transaction/usecase/transaction.service';
import { PaymentRepository } from '../persistence/payment.repository';
import { Logger } from '@nestjs/common';
import { BidService } from 'src/modules/bid/usecase/bid.service';
import { Payment } from '../persistence/payment.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private id: string;
  private paymentGateway: string;
  private price: number;

  constructor(
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
    private paymentRepository: PaymentRepository,
    private readonly bidService: BidService,
  ) {}

  async initializeChapaPayment(
    transactionId: string,
    price: number,
    email: string,
    firstName: string,
    lastName: string,
    bidId: string,
    phoneNumber: string,
  ) {
    const chapaUrl = 'https://api.chapa.co/v1/transaction/initialize';
    const apiKey = process.env.CHAPA_API_KEY;
    const txRef = transactionId + '.' + bidId;
    const stringPrice = price.toString(); // Convert price to string

    if (!apiKey) {
      throw new HttpException(
        'Chapa API key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (price <= 0) {
      throw new HttpException(
        'Payment can not be zero or less',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (price >= 100000) {
      throw new HttpException(
        'Payment can not be morethan 100,000 for testing',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!email || !firstName || !lastName) {
      throw new HttpException(
        'Buyer details are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log(price, 'price');

    try {
      // Initialize Chapa payment
      const response = await axios.post(
        chapaUrl,
        {
          amount: price, // Chapa expects string per example
          // amount: '10000',
          currency: 'ETB',
          email,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber, // Include if provided
          tx_ref: txRef,
          callback_url:
            process.env.CHAPA_CALLBACK_URL ||
            'https://yourdomain.com/api/payment/verify',
          return_url: `${process.env.CHAPA_RETURN_URL}?tx_ref=${txRef}`,

          customization: {
            title: 'Payment ',
            description: ` ${stringPrice} ETB .Txn ${transactionId}.`,
          },
          meta: {
            hide_receipt: 'false',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(response.data);
      // Create payment
      const payment = await this.paymentRepository.makePayment(price);

      return { ...response.data, paymentId: payment.id };
    } catch (error) {
      this.logger.error(
        `Failed to initialize payment: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.response?.data?.message || 'Failed to initialize payment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // payment.service.ts
  async verifyChapaPayment(trxRef: string) {
    const verifyUrl = `https://api.chapa.co/v1/transaction/verify/${trxRef}`;
    const apiKey = process.env.CHAPA_API_KEY;

    if (!apiKey) {
      throw new HttpException(
        'Chapa API key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const response = await axios.get(verifyUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const data = response.data?.data;

      if (response.data.status !== 'success' || data.status !== 'success') {
        throw new HttpException(
          'Payment verification failed or not successful yet',
          HttpStatus.BAD_REQUEST,
        );
      }

      // TODO: Optionally update DB payment status here using trxRef

      return {
        message: 'Payment verified successfully',
        data: {
          tx_ref: data.tx_ref,
          ref_id: data.chapa_ref,
          amount: data.amount,
          email: data.email,
          status: data.status,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Error verifying payment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getPaymentDetailsByTransactionId(transactionId: string) {
    const [cleanId, bidId] = transactionId.split('.');
    const bid = await this.bidService.getBid(bidId);
    const userId = bid.rfq.createdBy.id;
    console.log('userId', userId);
    console.log('cleanId', cleanId);
    const transaction = await this.transactionService.getTransactionByIdAndUser(
      cleanId,
      userId,
    );

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const amount = transaction.bid.totalPrice;
    const date = transaction.date;
    const projectName = transaction.bid.rfq.projectName;

    return {
      transactionId: cleanId,
      amount,
      date,
      projectName,
    };
  }

  /**
   * Syncs private attributes with a Payment entity
   */
  private syncWithPayment(payment: Payment): void {
    this.id = payment.id;
    this.paymentGateway = payment.paymentGateway;
    this.price = payment.price;
  }
}
