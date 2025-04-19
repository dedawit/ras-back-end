import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async makePayment(price: number, paymentGateway?: string) {
    const payment = this.paymentRepository.create({
      price,
      paymentGateway,
    });
    return this.paymentRepository.save(payment);
  }
}
