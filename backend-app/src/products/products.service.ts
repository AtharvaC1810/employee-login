import { Injectable, NotFoundException } from "@nestjs/common";
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

  // -------------------------------
  // CREATE PRODUCT
  // -------------------------------
  async create(dto: CreateProductDto, file?: Multer.File) {
    const product = this.productRepo.create({
      ...dto,
      image: file?.filename || null,
    });

    return this.productRepo.save(product);
  }

  // -------------------------------
  // GET ALL PRODUCTS
  // -------------------------------
  findAll() {
    return this.productRepo.find();
  }

  // -------------------------------
  // GET ONE PRODUCT
  // -------------------------------
  async findOne(id: number) {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) throw new NotFoundException("Product not found");

    return product;
  }

  // -------------------------------
  // UPDATE PRODUCT   <-- FIX
  // -------------------------------
  async update(id: number, dto: CreateProductDto, file?: Multer.File) {
    const product = await this.findOne(id);

    // Remove old image if new one is uploaded
    if (file && product.image) {
      const oldPath = `./uploads/products/${product.image}`;
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updatedProduct = {
      ...product,
      ...dto,
      image: file?.filename || product.image,
    };

    await this.productRepo.save(updatedProduct);
    return updatedProduct;
  }

  // -------------------------------
  // DELETE PRODUCT
  // -------------------------------
  async remove(id: number) {
    const product = await this.findOne(id);

    // Delete product image
    if (product.image) {
      const filePath = `./uploads/products/${product.image}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    return this.productRepo.remove(product);
  }
}
