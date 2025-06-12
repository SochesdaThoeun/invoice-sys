import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from './User';
import { Customer } from './Customer';

@Entity({ name: 'business_addresses' })
export class BusinessAddress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  sellerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller!: User;
  
  @Column()
  businessId!: string;
  
  @Column()
  country!: string;
  
  @Column()
  state!: string;
  
  @Column()
  street!: string;
  
  @Column()
  houseNumber!: string;
  
  @Column({ type: 'text' })
  address!: string;
  
  @OneToOne(() => Customer, customer => customer.businessAddress)
  customer?: Customer;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export default BusinessAddress; 