import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  
  @Entity('rfq') 
  export class RFQ {
    @PrimaryGeneratedColumn()
    id: number; 
  
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
  }
  