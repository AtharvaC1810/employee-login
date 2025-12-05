import { Injectable, UnauthorizedException, BadRequestException, NotFoundException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/user-role.enum';
import { UpdateProfileDto } from './dto/update-profile.dto';



@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

async register(dto: RegisterDto) {
  console.log("[AuthService] Registering user:", dto.email);

  const email = typeof dto.email === "string" ? dto.email.trim() : "";

  if (!email) {
    throw new BadRequestException("Email is required");
  }

  const existing = await this.userRepository.findOne({ where: { email } });
  if (existing) {
    console.log("[AuthService] Duplicate email found:", existing.email);
    throw new BadRequestException("Email already in use");
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = this.userRepository.create({
    name: dto.name,
    email,
    password: hashedPassword,
    role: UserRole.INTERN,
  });

  await this.userRepository.save(user);

  const payload = { sub: user.id, email: user.email, role: user.role };
  const access_token = this.jwtService.sign(payload);

  const { password, ...safeUser } = user;

  return {
    access_token, // <-- REQUIRED by frontend
    user: safeUser,
  };
}

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    const { password: pw, ...safeUser } = user;
    return safeUser;
  }

  async login(dto: LoginDto) {
  // Ensure email and password are strings
  const email = typeof dto.email === 'string' ? dto.email.trim() : '';
  const password = typeof dto.password === 'string' ? dto.password : '';

  if (!email || !password) {
    throw new BadRequestException('Email and password are required');
  }

  const user = await this.userRepository.findOne({ where: { email } });
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const payload = { sub: user.id, email: user.email, role: user.role };
  const access_token = this.jwtService.sign(payload);

  console.log('[AuthService] Login successful for user:', user.email);

  return {
    access_token,          
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

async updateProfile(userId: number, dto: UpdateProfileDto) {
  const user = await this.userRepository.findOne({ where: { id: userId } });

  if (!user) throw new NotFoundException('User not found');

  if (dto.email) user.email = dto.email;
  if (dto.name) user.name = dto.name;

  if (dto.password) {
    const hashed = await bcrypt.hash(dto.password, 10);
    user.password = hashed;
  }

  await this.userRepository.save(user);

  return { message: 'Profile updated successfully' };
}

}