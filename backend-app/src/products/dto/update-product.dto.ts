import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  vendorId?: number;

  @IsOptional()
  @IsString()
  image?: string; // <-- add this
}
