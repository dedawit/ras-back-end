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

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
    private paymentRepository: PaymentRepository,
  ) {}

  async initializeChapaPayment(
    transactionId: string,
    price: number,
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string, // Optional, as it’s not always required
  ) {
    const chapaUrl = 'https://api.chapa.co/v1/transaction/initialize';
    const apiKey = process.env.CHAPA_API_KEY;
    const txRef = transactionId || uuidv4();

    if (!apiKey) {
      throw new HttpException(
        'Chapa API key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (price <= 0) {
      throw new HttpException('Invalid payment amount', HttpStatus.BAD_REQUEST);
    }
    if (!email || !firstName || !lastName) {
      throw new HttpException(
        'Buyer details are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Initialize Chapa payment
      const response = await axios.post(
        chapaUrl,
        {
          // amount: price.toString(), // Chapa expects string per example
          amount: '10000',
          currency: 'ETB',
          email,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber || '0970713033', // Include if provided
          tx_ref: txRef,
          callback_url:
            process.env.CHAPA_CALLBACK_URL ||
            'https://yourdomain.com/api/payment/verify',
          return_url:
            process.env.CHAPA_RETURN_URL || 'https://yourdomain.com/bids',
          customization: {
            title: 'Payment ',
            description: `Payment for Transaction ${transactionId}`,
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
}
