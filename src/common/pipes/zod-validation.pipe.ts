import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { ZodTypeAny } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodTypeAny) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        errors[key] = issue.message;
      }
      throw new BadRequestException({ message: errors });
    }
    return result.data;
  }
}

export function createZodValidationPipe<TSchema extends ZodTypeAny>(schema: TSchema): ZodValidationPipe {
  return new ZodValidationPipe(schema);
}