import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }

  async sendMail(to: string, subject: string, html: string, text?: string) {
    const msg = {
      to,
      from: process.env.MAIL_FROM!,
      subject,
      text: text || undefined,
      html,
    };

    try {
      const response = await sgMail.send(msg);
      this.logger.log(`Mail sent to ${to}`);
      return response;
    } catch (err: any) {
      this.logger.error(`Failed to send mail: ${err.message}`);
      throw err;
    }
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
