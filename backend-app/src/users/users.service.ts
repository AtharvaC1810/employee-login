import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './user-role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  // List all users (admin only if role restriction enforced in controller)
  findAll(role?: UserRole) {
    if (role) return this.userRepo.find({ where: { role } });
    return this.userRepo.find();
  }

  async findOne(id: number, requestingUser?: User) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Non-admins can only access their own info
    if (requestingUser && requestingUser.role !== UserRole.ADMIN && requestingUser.id !== id) {
      throw new ForbiddenException('Access denied');
    }

    const { password, ...rest } = user as any;
    return rest;
  }

  async createByAdmin(dto: CreateUserDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
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

  async update(id: number, dto: UpdateUserDto, requestingUser?: User) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Non-admins can only update themselves
    if (requestingUser && requestingUser.role !== UserRole.ADMIN && requestingUser.id !== id) {
      throw new ForbiddenException('Access denied');
    }

    // If password is present, hash it
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    } else {
      delete dto.password; // don't overwrite with empty password
    }

    Object.assign(user, dto);
    await this.userRepo.save(user);
    const { password, ...rest } = user as any;
    return rest;
  }

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
