import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permissions.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  findAll(): Promise<Permission[]> {
    return this.permissionRepo.find();
  }

  async findOne(id: number): Promise<Permission> {
    const perm = await this.permissionRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException('Permission not found');
    return perm;
  }

  async create(name: string, description?: string): Promise<Permission> {
    const exists = await this.permissionRepo.findOne({ where: { name } });
    if (exists) throw new BadRequestException('Permission already exists');

    const perm = this.permissionRepo.create({ name, description });
    return await this.permissionRepo.save(perm);
  }

  async update(id: number, name: string, description?: string): Promise<Permission> {
    const perm = await this.permissionRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException('Permission not found');

    perm.name = name;
    perm.description = description;
    return await this.permissionRepo.save(perm);
  }

  async remove(id: number): Promise<{ message: string }> {
    const perm = await this.permissionRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException('Permission not found');

    await this.permissionRepo.remove(perm);
    return { message: 'Permission deleted successfully' };
  }
}
