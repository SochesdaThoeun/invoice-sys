import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from './User';
import { Customer } from './Customer';
import { Order } from './Order';

@Entity({ name: 'quotes' })
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  sellerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller!: User;

  @Column()
  customerId!: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column({ nullable: true })
  orderId?: string;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order?: Order;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalEstimate!: number;

  @Column({ nullable: true })
  expiresAt?: Date;

  @Column({ type: 'enum', enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'], default: 'DRAFT' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export default Quote; 