import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Patch, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      const result = await this.authService.register(dto);
      return { success: true, message: 'Registration successful', data: result };
    } catch (error: any) {
      throw new HttpException(
        { success: false, message: error.message || 'Registration failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      const result = await this.authService.login(dto);
      return { success: true, message: 'Login successful', data: result };
    } catch (error: any) {
      throw new HttpException(
        { success: false, message: error.message || 'Invalid credentials' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Patch('update-profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
  return this.authService.updateProfile(req.user.id, dto);
}

}
