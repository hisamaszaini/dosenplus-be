import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { ZodSchema } from 'zod';

@Injectable()
export class DataAndFileService {
  private readonly UPLOAD_PATH: string;

  constructor() {
    this.UPLOAD_PATH = path.resolve(process.cwd(), 'uploads');
  }

  generateFileName(original: string): string {
    return `${uuidv4()}${path.extname(original)}`;
  }

  async writeFile(file: Express.Multer.File, name: string): Promise<void> {
    try {
      const fullPath = path.join(this.UPLOAD_PATH, name);
      await fs.promises.writeFile(fullPath, file.buffer);
    } catch (err) {
      throw new InternalServerErrorException('Gagal menyimpan file');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    if (!filePath) return;
    const fullPath = path.join(this.UPLOAD_PATH, filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  validateAndInjectFilePath<T>(
    schema: ZodSchema<T>,
    rawData: any,
    filePath: string
  ): T {
    const enriched = {
      ...rawData,
      filePath,
    };

    const parsed = schema.safeParse(enriched);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }

    return parsed.data;
  }
}