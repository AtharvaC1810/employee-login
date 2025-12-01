import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Product } from '../../products/entities/products.entity';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150 })
  companyName: string;

  @Column({ length: 50, nullable: true })
  contactNumber: string;

  @Column({ length: 150, nullable: true })
  email: string; // removed unique constraint

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 50 })
  sector: string;

  @Column({ length: 30, nullable: true })
  gstNumber: string; // removed unique constraint

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ------------------------
  // Inverse relation to Product
  // ------------------------
  @OneToMany(() => Product, (product) => product.vendor)
  products: Product[];
}
