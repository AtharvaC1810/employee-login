import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User} from '../users/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './user-role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  findAll(role?: UserRole) {
    if (role) return this.userRepo.find({ where: { role }});
    return this.userRepo.find();
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user as any;
    return rest;
  }

  async createByAdmin(dto: CreateUserDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email }});
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

  async createSelf(dto: CreateUserDto) {
    return this.createByAdmin(dto);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id }});
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    await this.userRepo.save(user);
    const { password, ...rest } = user as any;
    return rest;
  }

  async remove(id: number) {
    const user = await this.userRepo.findOne({ where: { id }});
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
    const { password, ...rest } = user as any;
    return rest;
  }
}
