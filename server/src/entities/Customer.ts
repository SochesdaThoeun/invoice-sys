import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from './User';
import { BusinessAddress } from './BusinessAddress';

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  sellerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller!: User;

  @Column()
  name!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  businessRegistrationNumber?: string;

  @Column({ nullable: true })
  businessName?: string;

  @Column({ nullable: true })
  businessAddressId?: string;

  @OneToOne(() => BusinessAddress)
  @JoinColumn({ name: 'businessAddressId' })
  businessAddress?: BusinessAddress;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export default Customer; 