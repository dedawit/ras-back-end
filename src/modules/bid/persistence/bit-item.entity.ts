import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Bid } from './bid.entity';

@Entity('bid_item')
export class BidItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Bid, (bid) => bid.bidItems)
  @JoinColumn({ name: 'bidId' })
  bid: Bid;

  @Column()
  item: string;

  @Column({ type: 'float' })
  quantity: number;

  @Column()
  unit: string;

  @Column({ type: 'float' })
  singlePrice: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  transportFee: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  taxes: number;

  @Column({ type: 'float' })
  totalPrice: number;
}
