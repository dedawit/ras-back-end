import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Role } from '../utility/enums/role.enum';
import { RFQ } from 'src/modules/rfq/persistence/rfq.entity';  // Adjust path if needed

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  companyName: string;

  @Column()
  telephone: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role })
  lastRole: Role;

  @Column({ nullable: true })
  profile: string;

  @OneToMany(() => RFQ, (rfq) => rfq.user)
  rfqs: RFQ[];
}
