import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity({ name: 'ai_requests' })
export class AIRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  sellerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller!: User;

  @Column({ type: 'text' })
  prompt!: string;

  @Column({ type: 'jsonb', nullable: true })
  responseJson?: object;

  @Column({ type: 'integer', nullable: true })
  tokensUsed?: number;

  @CreateDateColumn()
  createdAt!: Date;
}

export default AIRequest; 