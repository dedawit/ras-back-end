import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/modules/user/persistence/user.entity'; // Adjust path if needed
import { RFQState } from '../utility/enums/rfq-state.enum';
import { Bid } from 'src/modules/bid/persistence/bid.entity';

@Entity('rfq')
export class RFQ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  projectName: string;

  @Column()
  purchaseNumber: string;

  @Column({ type: 'float' })
  quantity: number;

  @Column()
  category: string;

  @Column({ nullable: true })
  detail: string;

  @Column({
    type: 'enum',
    enum: RFQState,
    default: RFQState.OPENED,
  })
  state: RFQState;

  @Column()
  auctionDoc: string;

  @Column()
  guidelineDoc: string;

  @Column()
  deadline: Date;

  // Many-to-One relationship with the User entity for buyer
  @ManyToOne(() => User, (user) => user.rfqs)
  @JoinColumn({ name: 'buyerId' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => Bid, (bid) => bid.rfq)
  bids: Bid[];

}
