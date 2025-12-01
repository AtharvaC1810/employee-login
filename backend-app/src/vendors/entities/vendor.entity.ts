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

  @Column({ length: 100, default: 'Unknown Vendor' })
  name: string;

  @Column({ length: 150, default: 'Unknown Company' })
  companyName: string;

  @Column({ length: 50, nullable: true })
  contactNumber: string;

  @Column({ length: 150, nullable: true })
  email: string; 

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 50, default: 'Unknown Sector' })
 sector: string;


  @Column({ length: 30, nullable: true })
  gstNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Product, (product) => product.vendor)
  products: Product[];
}
