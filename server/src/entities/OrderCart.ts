import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './Product';
import { User } from './User';
import { TaxCode } from './TaxCode';

@Entity({ name: 'order_carts' })
export class OrderCart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  orderId!: string;

  @ManyToOne('Order', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: any;

  @Column({ nullable: true })
  productId?: string;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @Column()
  sellerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller!: User;

  @Column()
  sku!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lineTotal!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate!: number;

  @Column({ nullable: true })
  taxCodeId?: string;

  @ManyToOne(() => TaxCode, { nullable: true })
  @JoinColumn({ name: 'taxCodeId' })
  taxCode?: TaxCode;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export default OrderCart; 