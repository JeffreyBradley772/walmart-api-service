import * as z from 'zod';

export const FullSearchQuerySchema = z.object({
  query: z.string().nonempty().describe('Search query'),
  sort: z
    .string()
    .nullable()
    .optional()
    .describe('Sort by attribute (e.g., price, title)'),
  order: z.enum(['asc', 'desc']).nullable().optional().describe('Sort order'),
  numItems: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(25)
    .nullable()
    .optional()
    .describe('Number of items to return'),
  start: z
    .coerce
    .number()
    .int()
    .min(1)
    .nullable()
    .optional()
    .describe('Starting item number for pagination'),
  responseGroup: z
    .string()
    .nullable()
    .optional()
    .describe('Response group (e.g., base, full)'),
  facet: z.string().nullable().optional().describe('Enable faceting'),
  'facet.filter': z.string().nullable().optional().describe('Facet filter'),
  'facet.range': z.string().nullable().optional().describe('Facet range'),
});

export const SimpleSearchQuerySchema = z.object({
  product: z.string().nonempty().describe('Product to search for'),
  numItems: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(25)
    .nullable()
    .optional()
    .default(24)
    .describe('Number of items to return'),
  start: z
    .coerce
    .number()
    .int()
    .min(1)
    .nullable()
    .default(1)
    .optional()
    .describe('Starting item number for pagination'),
});
