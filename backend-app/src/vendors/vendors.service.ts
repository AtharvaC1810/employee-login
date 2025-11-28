import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {}

  // CREATE
  create(dto: CreateVendorDto) {
    const vendor = this.vendorRepo.create(dto);
    return this.vendorRepo.save(vendor);  // ⬅ FIXED (single object, not array)
  }

  // FIND ALL
  findAll() {
    return this.vendorRepo.find();
  }

  // FIND ONE
  async findOne(id: number) {
    const vendor = await this.vendorRepo.findOne({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  // UPDATE
  async update(id: number, dto: UpdateVendorDto) {
    const vendor = await this.findOne(id);
    Object.assign(vendor, dto);
    return this.vendorRepo.save(vendor);
  }

  // DELETE
  async remove(id: number) {
    const vendor = await this.findOne(id);
    return this.vendorRepo.remove(vendor);
  }
}
