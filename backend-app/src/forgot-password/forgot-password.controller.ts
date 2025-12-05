import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ForgotPasswordService } from './forgot-password.service';
import { RequestResetDto } from './dto/request-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('forgot-password')
export class ForgotPasswordController {
  constructor(private readonly fps: ForgotPasswordService) {}

  // Request a password reset
  @Post('request')
  async requestReset(@Body() body: RequestResetDto) {
    if (!body.email) throw new BadRequestException('Email is required');
    return this.fps.requestReset(body.email);
  }

  // Reset password using token
  @Post('reset')
  async reset(@Body() body: ResetPasswordDto) {
    if (!body.token || !body.newPassword) {
      throw new BadRequestException('Token and new password are required');
    }
    return this.fps.resetPassword(body.token, body.newPassword);
  }
}
