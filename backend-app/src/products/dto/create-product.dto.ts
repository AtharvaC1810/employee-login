import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @IsNumber()
  orderPrice: number;

  @IsNotEmpty()
  @IsNumber()
  vendorId: number; 

  @IsOptional()
  @IsString()
  details?: string;
}
