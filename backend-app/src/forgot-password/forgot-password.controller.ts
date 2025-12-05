import { Controller, Post, Body } from '@nestjs/common';
import { ForgotPasswordService } from './forgot-password.service';
import { RequestResetDto } from './dto/request-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('forgot-password')
export class ForgotPasswordController {
  constructor(private readonly fps: ForgotPasswordService) {}

  // request reset - sends email if account exists (returns success either way)
  @Post('request')
  async requestReset(@Body() body: RequestResetDto) {
    return this.fps.requestReset(body.email);
  }

  // perform reset using token
  @Post('reset')
  async reset(@Body() body: ResetPasswordDto) {
    return this.fps.resetPassword(body.token, body.newPassword);
  }
}
