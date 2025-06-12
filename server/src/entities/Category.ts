import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
}

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  sellerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller!: User;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: CategoryType })
  type!: CategoryType;

  @Column({ nullable: true })
  parentId?: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: Category;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export default Category; 