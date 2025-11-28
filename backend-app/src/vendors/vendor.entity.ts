import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  companyName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  contactNumber: string;

  @Column({ type: 'text' })
  address: string;

  @Column()
  sector: string;

  @Column({ unique: true })
  gstNumber: string;

  @CreateDateColumn()
  createdAt: Date;
}
