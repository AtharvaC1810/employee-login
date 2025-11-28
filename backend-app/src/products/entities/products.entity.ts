import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column("decimal")
  price: number;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  image: string;

  // NEW FIELD
  @Column()
  vendorId: number;

  @Column({ nullable: true })
  vendorName: string;
}
