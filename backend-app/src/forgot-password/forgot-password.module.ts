import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { ForgotPasswordService } from './forgot-password.service';
import { ForgotPasswordController } from './forgot-password.controller';
import { MailService } from '../mail/mail.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([PasswordResetToken]), UsersModule],
  controllers: [ForgotPasswordController],
  providers: [ForgotPasswordService, MailService],
  exports: [ForgotPasswordService],
})
export class ForgotPasswordModule {}
