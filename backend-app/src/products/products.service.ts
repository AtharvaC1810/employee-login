import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entities/products.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { Multer } from "multer";
import * as fs from "fs";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // ----------------------------------------------------
  // CREATE PRODUCT
  // ----------------------------------------------------
  async create(dto: CreateProductDto, file?: Multer.File) {
    // Validation
    if (!dto.name || !dto.price || !dto.vendorId) {
      throw new BadRequestException("Name, Price, and VendorId are required");
    }

    const product = this.productRepo.create({
      name: dto.name,
      price: dto.price,
      quantity: dto.quantity ?? 0,
      vendorId: dto.vendorId,
      vendorName: dto.vendorName ?? undefined,
      image: file?.filename ?? undefined,
    });

    return this.productRepo.save(product);
  }

  // ----------------------------------------------------
  // GET ALL PRODUCTS
  // ----------------------------------------------------
  findAll() {
    return this.productRepo.find();
  }

  // ----------------------------------------------------
  // GET ONE PRODUCT
  // ----------------------------------------------------
  async findOne(id: number) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  // ----------------------------------------------------
  // UPDATE PRODUCT
  // ----------------------------------------------------
  async update(id: number, dto: CreateProductDto, file?: Multer.File) {
    const product = await this.findOne(id);

    // Remove old image if new one uploaded
    if (file && product.image) {
      const oldPath = `./uploads/products/${product.image}`;
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updatedProduct = {
      ...product,
      name: dto.name ?? product.name,
      price: dto.price ?? product.price,
      quantity: dto.quantity ?? product.quantity,
      vendorId: dto.vendorId ?? product.vendorId,
      vendorName: dto.vendorName ?? product.vendorName,
      image: file?.filename ?? product.image,
    };

    await this.productRepo.save(updatedProduct);
    return updatedProduct;
  }

  // ----------------------------------------------------
  // DELETE PRODUCT
  // ----------------------------------------------------
  async remove(id: number) {
    const product = await this.findOne(id);

    // Delete image file if exists
    if (product.image) {
      const filePath = `./uploads/products/${product.image}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    return this.productRepo.remove(product);
  }
}
