import * as z from 'zod';
import { CarBrandSortColumns } from '@/domain/car-brand.filter';
import { DefaultTake, MaxTake, SortOrder } from '@/domain/utils';

export const carBrandSearchMcpInputSchema = {
  query: z.string().nullable().optional().describe('Free-text search in car brand names.'),
  isActive: z.boolean().nullable().optional().describe('Filter by active status. Omit for no filter.'),
  skip: z.number().int().min(0).optional().describe('Pagination offset (default 0).'),
  take: z.number().int().min(0).max(MaxTake).optional().describe(`Page size (default ${DefaultTake}, max ${MaxTake}).`),
  sortBy: z
    .nativeEnum(CarBrandSortColumns)
    .optional()
    .describe(`Sort column. Values: ${Object.values(CarBrandSortColumns).join(', ')}.`),
  sortOrder: z.nativeEnum(SortOrder).optional().describe('Sort direction: asc or desc.'),
};

export const carBrandReadMcpInputSchema = {
  id: z.uuid().describe('Car brand UUID.'),
};
