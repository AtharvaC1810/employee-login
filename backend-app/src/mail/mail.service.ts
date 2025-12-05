import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);
  private EMAIL_FROM: string;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;

    if (!apiKey) {
      throw new Error("SENDGRID_API_KEY is missing in environment variables");
    }
    if (!emailFrom) {
      throw new Error("EMAIL_FROM is missing in environment variables");
    }

    this.EMAIL_FROM = emailFrom;
    sgMail.setApiKey(apiKey);
  }

  async sendMail(to: string, subject: string, html: string, text?: string) {
    try {
      const msg = {
        to,
        from: this.EMAIL_FROM,
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
        <p>Click the button below to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
      </div>
    `;
  }
}
