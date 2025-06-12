import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Category } from './Category';

export enum SourceType {
  INVOICE = 'INVOICE',
  ORDER = 'ORDER',
  QUOTE = 'QUOTE',
  PAYMENT = 'PAYMENT',
  ADJUSTMENT = 'ADJUSTMENT',
  EXPENSE = 'EXPENSE',
}

@Entity({ name: 'ledger_entries' })
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  sellerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller!: User;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  debit!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  credit!: number;

  @Column()
  categoryId!: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Column({ type: 'enum', enum: SourceType })
  sourceType!: SourceType;

  @Column()
  sourceId!: string;

  @Column()
  transactionGroupId!: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;
}

export default LedgerEntry; 