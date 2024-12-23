import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/user/persistence/user.entity';  // Adjust path if needed

@Entity('rfq')
export class RFQ {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar' })
  productName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar' })
  category: string;

  @Column({ type: 'text' })
  detail: string;

  @Column({ type: 'boolean', default: true })
  state: boolean;

  @Column({ type: 'varchar' })
  file: string;

  @Column({ type: 'timestamp' })
  deadline: Date;

  @ManyToOne(() => User, (user) => user.rfqs)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
