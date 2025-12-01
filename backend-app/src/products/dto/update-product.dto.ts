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

  // New: optional image field (string filename saved by Multer)
  @IsOptional()
  @IsString()
  image?: string;
}
