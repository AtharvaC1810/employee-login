import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Vendor } from '../vendors/entities/vendor.entity';

// DTO for returning products with vendorName + image
export class ProductResponseDto {
  id: number;
  name: string;
  price: number;
  vendorId: number;
  vendorName: string;
  image: string | null;
  imageUrl: string | null;
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
    const products = await this.productRepository.find({
      relations: ['vendor'],
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      vendorId: p.vendor.id,
      vendorName: p.vendor.companyName || p.vendor.name,
      image: p.image || null,
      imageUrl: p.image ? `/uploads/products/${p.image}` : null,
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
      image: product.image || null,
      imageUrl: product.image ? `/uploads/products/${product.image}` : null,
    };
  }

  // ----------------------------
  // Create product
  // ----------------------------
  async create(
    dto: CreateProductDto,
    imageFilename?: string,
  ): Promise<ProductResponseDto> {
    const vendor = await this.vendorRepository.findOne({
      where: { id: dto.vendorId },
    });

    if (!vendor) throw new NotFoundException('Vendor not found');

    const product = this.productRepository.create({
      name: dto.name,
      price: dto.price,
      vendor,
      image: dto.image, // if using image filename
    });

    const saved = await this.productRepository.save(product); // single entity

      return {
      id: saved.id,
      name: saved.name,
      price: saved.price,
      vendorId: saved.vendor.id,
      vendorName: saved.vendor.companyName || saved.vendor.name,
      image: saved.image, 
      imageUrl: saved.image ? `/uploads/products/${saved.image}` : null,
    };


  }

  // ----------------------------
  // Update product
  // ----------------------------
  async update(
    id: number,
    dto: UpdateProductDto,
    imageFilename?: string,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['vendor'],
    });

    if (!product) throw new NotFoundException('Product not found');

    // Apply updates
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.price !== undefined) product.price = dto.price;

    if (dto.vendorId !== undefined) {
      const vendor = await this.vendorRepository.findOne({
        where: { id: dto.vendorId },
      });

      if (!vendor) throw new NotFoundException('Vendor not found');

      product.vendor = vendor;
    }

    // New image uploaded?
    if (imageFilename) {
      product.image = imageFilename;
    }

    const saved = await this.productRepository.save(product);

    return {
      id: saved.id,
      name: saved.name,
      price: saved.price,
      vendorId: saved.vendor.id,
      vendorName: saved.vendor.companyName || saved.vendor.name,
      image: saved.image,
      imageUrl: saved.image ? `/uploads/products/${saved.image}` : null,
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
