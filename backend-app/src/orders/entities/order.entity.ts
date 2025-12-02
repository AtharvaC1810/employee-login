import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/products.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'productId' })
  product?: Product | null;

  @Column({ nullable: true })
  productId?: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalPrice: number;

  @Column({ nullable: true })
  userId?: number;

  @CreateDateColumn()
  createdAt: Date;
}



