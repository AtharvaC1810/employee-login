import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Vendor } from '../vendors/entities/vendor.entity';

// DTO for returning products with vendorName
export class ProductResponseDto {
  id: number;
  name: string;
  price: number;
  vendorId: number;
  vendorName: string;
  image?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  // ----------------------------
  // Get all products
  // ----------------------------
  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.find({ relations: ['vendor'] });

    return products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      vendorId: p.vendor.id,
      vendorName: p.vendor.companyName || p.vendor.name,
      image: p.image ?? undefined,
    }));
  }

  // ----------------------------
  // Get single product
  // ----------------------------
  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['vendor'],
    });
    if (!product) throw new NotFoundException('Product not found');

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      vendorId: product.vendor.id,
      vendorName: product.vendor.companyName || product.vendor.name,
      image: product.image ?? undefined,
    };
  }

  // ----------------------------
  // Create product
  // ----------------------------
  async create(dto: CreateProductDto, image?: string): Promise<ProductResponseDto> {
    const vendor = await this.vendorRepository.findOne({ where: { id: dto.vendorId } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const product = this.productRepository.create({
      name: dto.name,
      price: dto.price,
      vendor,
      image: image ?? undefined,
    });

    const saved = await this.productRepository.save(product);

    return {
      id: saved.id,
      name: saved.name,
      price: saved.price,
      vendorId: saved.vendor.id,
      vendorName: saved.vendor.companyName || saved.vendor.name,
      image: saved.image ?? undefined,
    };
  }

  // ----------------------------
  // Update product
  // ----------------------------
  async update(id: number, dto: UpdateProductDto, image?: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['vendor'],
    });
    if (!product) throw new NotFoundException('Product not found');

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.vendorId !== undefined) {
      const vendor = await this.vendorRepository.findOne({ where: { id: dto.vendorId } });
      if (!vendor) throw new NotFoundException('Vendor not found');
      product.vendor = vendor;
    }
    if (image !== undefined) product.image = image;

    const saved = await this.productRepository.save(product);

    return {
      id: saved.id,
      name: saved.name,
      price: saved.price,
      vendorId: saved.vendor.id,
      vendorName: saved.vendor.companyName || saved.vendor.name,
      image: saved.image ?? undefined,
    };
  }

  // ----------------------------
  // Delete product
  // ----------------------------
  async remove(id: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepository.remove(product);
  }
}
