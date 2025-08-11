import {
  PipeTransform,
  BadRequestException,
  ArgumentMetadata,
  Injectable,
} from '@nestjs/common';
import { ZodSchema } from '@nest-zod/z';

/**
 * Reusable pipe for validating incoming data using Zod schemas on a per pipe basis.
 */
@Injectable()
export class ZodSchemaPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}
  transform(value: any, metadata: ArgumentMetadata): any {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        issues: result.error.flatten(),
      });
    }
    return result.data; // parsed and coerced
  }
}
