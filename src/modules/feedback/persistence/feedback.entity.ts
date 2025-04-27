import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Transaction } from 'src/modules/transaction/persistence/transaction.entity';
import { User } from 'src/modules/user/persistence/user.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transactionId: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'int' })
  star: number;

  @ManyToOne(() => Transaction, (transaction) => transaction.id)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
