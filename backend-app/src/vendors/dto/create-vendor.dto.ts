import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateVendorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  sector: string;

  @IsNotEmpty()
  @IsString()
  gstNumber: string;
}
