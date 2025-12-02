export class OrderResponseDto {
  id: number;
  productId?: number;
  productName?: string;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
  userId?: number;
}
