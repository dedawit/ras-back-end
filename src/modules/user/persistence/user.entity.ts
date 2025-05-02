import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Role } from '../utility/enums/role.enum';
import { RFQ } from 'src/modules/rfq/persistence/rfq.entity'; // Adjust path if needed
import { Bid } from 'src/modules/bid/persistence/bid.entity';
import { Product } from 'src/modules/product/persistence/product.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  companyName: string;

  @Column()
  telephone: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, nullable: true })
  lastRole: Role;

  @Column({ nullable: true })
  profile: string;

  @OneToMany(() => RFQ, (rfq) => rfq.createdBy)
  rfqs: RFQ[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ default: 0 })
  tokenVersion: number;

  @OneToMany(() => Bid, (bid) => bid.createdBy)
  bids: Bid[];

  @OneToMany(() => Product, (product) => product.createdBy)
  products: Product[];
}
