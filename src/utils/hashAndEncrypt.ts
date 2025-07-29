import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class HashAndEncryptService {
  private readonly SALT_ROUNDS = 10;
  private readonly key: Buffer;
  constructor(private configService: ConfigService) {
    const secret = this.configService.get<string>('DATA_SECRET');
    if (!secret) {
      throw new Error('DATA_SECRET is not defined in the environment');
    }

    this.key = crypto.createHash('sha256').update(secret).digest();
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  hashSha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  encryptDataAES(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decryptDataAES(payload: string): string {
    const [ivHex, encryptedHex] = payload.split(':');
    if (!ivHex || !encryptedHex) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }
}
