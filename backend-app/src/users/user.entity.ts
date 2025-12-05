import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user-role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.INTERN,
  })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  resetToken?: string | null;

  @Column({ type: 'bigint', nullable: true })
  resetTokenExpiry?: number | null;
}
