import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';

export type TransactionType = 'income' | 'expense';
export type TransactionStatus =
  | 'Active'
  | 'Inactive'
  | 'Completed'
  | 'Pending'
  | 'Failed';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  date: Date;

  @Column()
  type: TransactionType;

  @Column()
  reference: string;

  @Column()
  counterparty: string;

  @Column({ default: 'Active' })
  status: TransactionStatus;

  @Column({ nullable: true })
  narration: string;

  @Column()
  categoryId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
