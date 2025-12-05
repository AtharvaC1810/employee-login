import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { generateToken, hashToken, compareToken } from '../common/utils';

@Injectable()
export class ForgotPasswordService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepo: Repository<PasswordResetToken>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  private getExpiryDate() {
    const minutes = Number(process.env.RESET_TOKEN_TTL_MINUTES || 30);
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutes);
    return d;
  }

  // Request a reset: creates token + emails user
  async requestReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // do not reveal that email does not exist — respond success anyway OR return 200 for security.
      return { ok: true };
    }

    // generate token and store hashed
    const token = generateToken(32);
    const tokenHash = await hashToken(token);

    // Invalidate old tokens for this user (optional)
    await this.tokenRepo.update({ userId: user.id, used: false }, { used: true });

    const pr = this.tokenRepo.create({
      tokenHash,
      user,
      userId: user.id,
      expiresAt: this.getExpiryDate(),
    });

    await this.tokenRepo.save(pr);

    // build reset URL
    const frontendUrl = (process.env.FRONTEND_BASE_URL || '').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}&uid=${user.id}`;

    // send mail
    const html = this.mailService.buildResetHtml(user.name || user.email, resetUrl);
    await this.mailService.sendMail(user.email, 'Password reset', html);

    return { ok: true };
  }

  // Reset password given token
async resetPassword(token: string, newPassword: string) {
  const candidates = await this.tokenRepo.find({
    where: { used: false, expiresAt: Not(IsNull()) },
    relations: ['user'],
    order: { createdAt: 'DESC' },
  });

  let match: PasswordResetToken | null = null;
  for (const c of candidates) {
    if (c.expiresAt < new Date()) continue;

    const ok = await compareToken(c.tokenHash, token);
    if (ok) {
      match = c;
      break;
    }
  }

  if (!match) throw new BadRequestException('Invalid or expired token');

  const user = match.user;
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // FIXED: use user.id (number)
  await this.usersService.updatePassword(user.id, newPassword);

  match.used = true;
  await this.tokenRepo.save(match);

  return { ok: true };
}


}
