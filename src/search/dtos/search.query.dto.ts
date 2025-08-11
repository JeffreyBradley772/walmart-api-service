import { createZodDto } from 'nestjs-zod';
import {
  FullSearchQuerySchema,
  SimpleSearchQuerySchema,
} from '@/search/schemas';

export class FullSearchQueryDto extends createZodDto(FullSearchQuerySchema) {}

export class SimpleSearchQueryDto extends createZodDto(SimpleSearchQuerySchema) {}
