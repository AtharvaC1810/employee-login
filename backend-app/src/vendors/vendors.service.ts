import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepo: Repository<Vendor>,
  ) {}

  async findAll(): Promise<Vendor[]> {
    return this.vendorRepo.find();
  }

  async findOne(id: number): Promise<Vendor> {
    const vendor = await this.vendorRepo.findOne({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async create(dto: CreateVendorDto): Promise<Vendor> {
    const vendor = this.vendorRepo.create(dto);
    return this.vendorRepo.save(vendor);
  }

  async update(id: number, dto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findOne(id);
    Object.assign(vendor, dto);
    return this.vendorRepo.save(vendor);
  }

  async remove(id: number): Promise<string> {
    await this.vendorRepo.delete(id);
    return 'Vendor deleted successfully';
  }
}
