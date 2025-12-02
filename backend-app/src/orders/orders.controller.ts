import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ---------------------------
  // CREATE ORDER
  // ---------------------------
  @Post()
  async createOrder(
    @Body() body: { productId: number; quantity: number; userId?: number },
  ): Promise<Order> {
    return this.ordersService.createOrder(body);
  }

  // ---------------------------
  // GET ALL ORDERS
  // ---------------------------
  @Get()
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  // ---------------------------
  // GET SINGLE ORDER
  // ---------------------------
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  // ---------------------------
  // DELETE ORDER
  // ---------------------------
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.ordersService.remove(id);
    return { message: 'Order deleted successfully' };
  }
}
