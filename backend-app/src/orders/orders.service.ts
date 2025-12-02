import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/products.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // ---------------------------
  // CREATE ORDER
  // ---------------------------
  async createOrder(dto: { productId: number; quantity: number; userId?: number }) {
    const { productId, quantity, userId } = dto;

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const totalPrice = Number(product.price) * quantity;

    const order = this.orderRepository.create({
      productId,
      quantity,
      totalPrice,
      userId: userId ?? undefined, // ✅ avoid null
    });

    return this.orderRepository.save(order);
  }

  // ---------------------------
  // GET ALL ORDERS
  // ---------------------------
  findAll() {
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['product'],
    });
  }

  // ---------------------------
  // GET SINGLE ORDER
  // ---------------------------
  findOne(id: number) {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['product'],
    });
  }
}
