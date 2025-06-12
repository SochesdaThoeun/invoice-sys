import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from './Order';

@Entity({ name: 'payment_types' })
export class PaymentType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;
  
  @Column({ nullable: true, type: 'text' })
  description?: string;
  
  @Column({ default: true })
  isActive!: boolean;
  
  @OneToMany(() => Order, order => order.paymentType)
  orders?: Order[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export default PaymentType; 