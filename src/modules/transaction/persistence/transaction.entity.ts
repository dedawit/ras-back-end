import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { Bid } from 'src/modules/bid/persistence/bid.entity';
import { Payment } from 'src/modules/payment/persistence/payment.entity';

@Entity('transaction')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transactionId: string;

  @OneToOne(() => Bid, (bid) => bid.transaction)
  @JoinColumn({ name: 'bidId' })
  bid: Bid;

  @OneToOne(() => Payment, (payment) => payment.transaction, {
    nullable: true,
  })
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @CreateDateColumn({ name: 'created_at' })
  date: Date;
}
