import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseJsonStringPipe implements PipeTransform {
  transform(value: any): any {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('Data harus berupa string JSON.');
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new BadRequestException('Data tidak valid. Harus berupa JSON string.');
    }
  }
}