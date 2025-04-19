import { Transaction } from 'src/modules/transaction/persistence/transaction.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float')
  price: number;

  @Column({ nullable: true })
  paymentGateway: string;

  @OneToOne(() => Transaction, (transaction) => transaction.payment)
  transaction: Transaction;
}
