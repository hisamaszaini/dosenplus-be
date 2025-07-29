import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: process.env.EMAIL_SECURE === 'true',
      //      secure: this.configService.get<boolean>('EMAIL_SECURE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(userEmail: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"<${this.configService.get<string>('NAME_APP')}>" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: userEmail,
      subject: 'Reset Password Akun Anda',
      html: `<p>Klik <a href="${resetLink}">link ini</a> untuk mereset password Anda. Link ini hanya valid selama 10 menit.</p>`,
    });
  }
}