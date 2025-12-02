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
  async createOrder(dto: { productId: number; quantity: number; }): Promise<Order> {
    const { productId, quantity } = dto;

    // Find product
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const totalPrice = Number(product.price) * quantity;

    // Create order
    const order = this.orderRepository.create({
      productId,          
      quantity,
      totalPrice,
      //userId: userId ?? undefined, // avoid null, set undefined if not provided
    });

    return await this.orderRepository.save(order);
  }

  // ---------------------------
  // GET ALL ORDERS
  // ---------------------------
  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['product'],      // include product details
      order: { createdAt: 'DESC' }, // newest first
    });
  }

  // ---------------------------
  // GET SINGLE ORDER
  // ---------------------------
  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ---------------------------
  // DELETE ORDER
  // ---------------------------
  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }
}
