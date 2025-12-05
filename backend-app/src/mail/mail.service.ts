import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async sendMail(to: string, subject: string, html: string, text?: string) {
    try {
      const msg = {
        to,
        from: process.env.EMAIL_FROM!,
        subject,
        text: text || undefined,
        html,
      };

      await sgMail.send(msg);
      this.logger.log(`Mail sent to ${to}`);
      return true;
    } catch (err: any) {
      this.logger.error(`SendGrid Error: ${err.message}`);
      throw err;
    }
  }

  buildResetHtml(name: string | undefined, resetUrl: string) {
    return `
      <div style="font-family: sans-serif; line-height:1.4;">
        <h2>Password reset request</h2>
        <p>Hello ${name || 'user'},</p>
        <p>Click below to reset your password:</p>
        <p><a href="${resetUrl}">Reset password</a></p>
      </div>
    `;
  }
}
