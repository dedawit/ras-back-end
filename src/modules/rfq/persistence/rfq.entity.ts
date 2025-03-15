import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/user/persistence/user.entity'; // Adjust path if needed

@Entity('rfq')
export class RFQ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  productName: string;

  @Column({ type: 'float' })
  quantity: number;

  @Column({ type: 'varchar' })
  category: string;

  @Column({ type: 'text', nullable: true })
  detail: string;

  @Column({ type: 'boolean', default: true })
  state: boolean;

  @Column({ nullable: true })
  file: string;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  // Many-to-One relationship with the User entity for buyer
  @ManyToOne(() => User, (user) => user.rfqs)
  @JoinColumn({ name: 'buyerId' })
  buyer: User;
}
