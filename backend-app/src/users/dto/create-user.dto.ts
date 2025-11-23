import { IsString, IsEmail, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../user-role.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string; 

  @IsString()
  name: string;

  @IsEnum(UserRole)
  role: UserRole;
}
