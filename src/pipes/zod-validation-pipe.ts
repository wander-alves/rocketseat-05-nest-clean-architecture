import { BadRequestException, PipeTransform } from '@nestjs/common';
import { fromZodError } from 'zod-validation-error/v3';
import { ZodError, ZodSchema } from 'zod/v3';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const message = 'Validation failed.';
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message,
          statusCode: 400,
          error: fromZodError(error),
        });
      }

      throw new BadRequestException(message);
    }
    return value;
  }
}
