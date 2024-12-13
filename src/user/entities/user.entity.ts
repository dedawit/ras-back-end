import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../enums/role.enum';

@Entity('users') 
export class User {
  @PrimaryGeneratedColumn()
  id: number; 

  @Column({ type: 'varchar', length: 255 })
  firstName: string; 

  @Column({ type: 'varchar', length: 255 })
  lastName: string; 

  @Column({ type: 'varchar', length: 255 })
  companyName: string; 

  @Column({ type: 'varchar', length: 20 })
  telephone: string; 

  @Column({ type: 'varchar', length: 255 })
  email: string; 

  @Column({ type: 'varchar', length: 255 })
  password: string; 

  @Column({ type: 'varchar', length: 255 })
  lastRole: Role;

  @Column({ type: 'text' })
  profile: string; 
}
