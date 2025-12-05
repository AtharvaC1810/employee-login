import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './user-role.enum';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // ------------------------------------------------
  // FIND USER BY EMAIL
  // ------------------------------------------------
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  // ------------------------------------------------
  // GENERATE RESET TOKEN
  // ------------------------------------------------
  async generateResetToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 3600000; // 1 hour in ms

    user.resetToken = token;
    user.resetTokenExpiry = expiry;

    await this.userRepo.save(user);

    return token;
  }

  // ------------------------------------------------
  // RESET PASSWORD USING TOKEN
  // ------------------------------------------------
async updatePassword(userId: number, newPassword: string) {
  const user = await this.userRepo.findOne({
    where: { id: userId },
  });

  if (!user) throw new NotFoundException("User not found");

  const hashed = await bcrypt.hash(newPassword, 10);

  user.password = hashed;

  await this.userRepo.save(user);

  return { message: "Password updated successfully" };
}


  // ------------------------------------------------
  // GET ALL USERS
  // ------------------------------------------------
  findAll(role?: UserRole) {
    if (role) return this.userRepo.find({ where: { role } });
    return this.userRepo.find();
  }

  // ------------------------------------------------
  // GET USER BY ID
  // ------------------------------------------------
  async findOne(id: number, requestingUser?: User) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (
      requestingUser &&
      requestingUser.role !== UserRole.ADMIN &&
      requestingUser.id !== id
    ) {
      throw new ForbiddenException('Access denied');
    }

    const { password, ...rest } = user as any;
    return rest;
  }

  // ------------------------------------------------
  // CREATE USER (ADMIN)
  // ------------------------------------------------
  async createByAdmin(dto: CreateUserDto) {
    const exists = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException('Email already exists');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: dto.role ?? UserRole.INTERN,
    });

    await this.userRepo.save(user);

    const { password, ...rest } = user as any;
    return rest;
  }

  // ------------------------------------------------
  // UPDATE USER
  // ------------------------------------------------
  async update(id: number, dto: UpdateUserDto, requestingUser?: User) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (
      requestingUser &&
      requestingUser.role !== UserRole.ADMIN &&
      requestingUser.id !== id
    ) {
      throw new ForbiddenException('Access denied');
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    } else {
      delete dto.password;
    }

    Object.assign(user, dto);
    await this.userRepo.save(user);

    const { password, ...rest } = user as any;
    return rest;
  }

  // ------------------------------------------------
  // DELETE USER
  // ------------------------------------------------
  async remove(id: number, requestingUser?: User) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (requestingUser && requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    await this.userRepo.remove(user);

    const { password, ...rest } = user as any;
    return rest;
  }
}
