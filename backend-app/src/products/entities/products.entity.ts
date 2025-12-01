import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from '../../vendors/entities/vendor.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.products)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column()
  vendorId: number;
}
