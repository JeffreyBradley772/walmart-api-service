import { createZodDto } from 'nestjs-zod';
import {
  WalmartProductSchema,
  WalmartApiResponseSchema,
} from '@/search/schemas';

export class WalmartProductDto extends createZodDto(WalmartProductSchema) {}
export class WalmartApiResponseDto extends createZodDto(WalmartApiResponseSchema) {}
