import nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter;
  private logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_PORT || 587),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string, text?: string) {
    const info = await this.transporter.sendMail({
      from: `"Employee Login" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text: text || undefined,
      html,
    });

    this.logger.log(`Mail sent: ${info.messageId}`);
    return info;
  }

  buildResetHtml(name: string | undefined, resetUrl: string) {
    return `
      <div style="font-family: sans-serif; line-height:1.4;">
        <h2>Password reset request</h2>
        <p>Hello ${name || 'user'},</p>
        <p>We received a request to reset your password. Click the link below to reset your password. This link will expire in ${process.env.RESET_TOKEN_TTL_MINUTES || 30} minutes.</p>
        <p><a href="${resetUrl}">Reset password</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
      </div>
    `;
  }
}
