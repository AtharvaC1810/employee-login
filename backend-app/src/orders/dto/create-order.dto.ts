import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @Type(() => Number)
  @IsInt()
  productId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  // optional: the frontend can send userId if needed
  //@IsOptional()
  //@Type(() => Number)
  //userId?: number;
}


