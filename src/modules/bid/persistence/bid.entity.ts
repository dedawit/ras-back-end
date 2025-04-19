import { RFQ } from 'src/modules/rfq/persistence/rfq.entity';
import { User } from 'src/modules/user/persistence/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BidItem } from './bit-item.entity';
import { BidState } from '../usecase/utility/bid-state.enum';
import { Transaction } from 'src/modules/transaction/persistence/transaction.entity';

@Entity('bid')
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RFQ, (rfq) => rfq.bids)
  @JoinColumn({ name: 'rfqId' })
  rfq: RFQ;

  @ManyToOne(() => User, (user) => user.bids)
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @Column({ type: 'text', nullable: true })
  files: string;

  @Column({ type: 'float' })
  totalPrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => BidItem, (bidItem) => bidItem.bid)
  bidItems: BidItem[];

  @Column({
    type: 'enum',
    enum: BidState,
    default: BidState.OPENED,
  })
  state: BidState;

  @OneToOne(() => Transaction, (transaction) => transaction.bid)
  transaction: Transaction;
}
