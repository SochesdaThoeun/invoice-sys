import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Product } from './Product';

@Entity({ name: 'tax_codes' })
export class TaxCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  sellerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller!: User;

  @Column()
  countryCode!: string;

  @Column({ nullable: true })
  region?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Product, (product) => product.taxCode)
  products!: Product[];
}

export default TaxCode; 