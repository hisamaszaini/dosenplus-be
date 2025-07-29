import { BadRequestException } from '@nestjs/common';
import z, { ZodTypeAny } from 'zod';

export function parseAndThrow<TSchema extends ZodTypeAny>(
  schema: TSchema,
  data: unknown,
): z.infer<TSchema> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as string;
      errors[key] = issue.message;
    }
    throw new BadRequestException(errors);
  }
  return result.data;
}