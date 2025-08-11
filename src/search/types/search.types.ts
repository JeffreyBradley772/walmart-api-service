import { z } from 'zod';
import {
  FullSearchQuerySchema,
  SimpleSearchQuerySchema,
  WalmartApiResponseSchema,
  WalmartProductSchema,
} from '@/search/schemas';

// Query Types
export type FullSearchQuery = z.infer<typeof FullSearchQuerySchema>;
export type SimpleSearchQuery = z.infer<typeof SimpleSearchQuerySchema>;
export type SearchQuery = FullSearchQuery | SimpleSearchQuery;

// Response Types
export type WalmartApiResponse = z.infer<typeof WalmartApiResponseSchema>;
export type WalmartProduct = z.infer<typeof WalmartProductSchema>;
