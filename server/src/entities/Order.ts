import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from './User';
import { Customer } from './Customer';
import { Quote } from './Quote';
import { Invoice } from './Invoice';
import { PaymentType } from './PaymentType';

@Entity({ name: 'orders' })
export class Order {
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
  paymentTypeId?: string;

  @ManyToOne(() => PaymentType)
  @JoinColumn({ name: 'paymentTypeId' })
  paymentType?: PaymentType;

  @OneToOne(() => Quote, quote => quote.order, { nullable: true })
  quote?: Quote;

  @OneToOne(() => Invoice, invoice => invoice.order, { nullable: true })
  invoice?: Invoice;

  @OneToMany('OrderCart', 'order')
  orderCarts?: any[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export default Order; 